import express from 'express';
import { WebSocketServer } from 'ws';
import { randomBytes } from 'crypto';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';
import { BeanChannel } from './channel.js';
import { MessageHistoryManager } from './message-history.js';
import { TopicMatchTracker } from './topic-tracker.js';
import { TopicFilterService } from './topic-filter.js';
import { AIModelConfig } from './types.js';
import { SessionManager } from './session-manager.js';

const CONFIG_FILE = path.join(process.cwd(), 'config.json');

export class ConfigServer {
  private app = express();
  private wss: WebSocketServer;
  private tokens = new Map<string, string>();
  private channel: BeanChannel | null = null;
  private openclawClients = new Map<string, any>();
  private messageHistory = new MessageHistoryManager();
  private matchTracker = new TopicMatchTracker();
  private topicFilter: TopicFilterService;
  private aiModels: AIModelConfig[] = [];
  private sessionManager = new SessionManager();
  private pendingReplies = new Map<string, NodeJS.Timeout>();

  constructor(private port: number) {
    this.topicFilter = new TopicFilterService(this.aiModels);
    this.app.use(express.json());
    this.app.use(express.static('public'));
    this.setupRoutes();

    const server = this.app.listen(this.port);
    this.wss = new WebSocketServer({ server });
    this.setupWebSocket();

    setTimeout(() => this.loadConfig(), 100);
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws, req) => {
      const path = req.url;
      console.log(`[WebSocket] New connection to ${path}`);

      if (path === '/openclaw') {
        this.handleOpenClawConnection(ws);
      }
    });
  }

  private handleOpenClawConnection(ws: any): void {
    let botId: string | null = null;

    ws.on('message', (data: any) => {
      console.log('[OpenClaw] Received message:', data.toString());
      const msg = JSON.parse(data.toString());

      if (!botId) {
        const entry = Array.from(this.tokens.entries()).find(([k, v]) => v === msg.token);
        if (!entry) {
          console.log('Invalid token:', msg.token);
          ws.close(1008, 'Invalid token');
          return;
        }
        botId = entry[0];
        this.openclawClients.set(botId, ws);
        console.log(`OpenClaw client ${botId} connected`);
        return;
      }

      console.log(`[OpenClaw] Received reply from ${botId}:`, msg);

      if (!msg.channelId || !botId) return;

      const session = this.sessionManager.getOrCreateSession(msg.channelId);
      const shouldCancel = this.sessionManager.shouldCancelAndRegenerate(msg.channelId);

      if (shouldCancel) {
        this.broadcast({ type: 'reply_cancelled', botId });
        const queued = this.sessionManager.getQueuedMessages(msg.channelId);
        session.messages.push(...queued);

        queued.forEach(m => this.forwardToOpenClaw(botId!, m));
        return;
      }

      this.broadcast({ type: 'openclaw_reply', botId, content: msg.content });

      if (this.channel && msg.channelId) {
        const adapters = (this.channel as any).adapters;
        const adapter = adapters.get(botId);
        if (adapter) {
          adapter.send(msg.channelId, msg.content);
        }
      }

      this.sessionManager.setIdle(msg.channelId);

      const queued = this.sessionManager.getQueuedMessages(msg.channelId);
      if (queued.length > 0) {
        this.broadcast({ type: 'processing_queue', botId, count: queued.length });
        session.messages.push(...queued);
        this.sessionManager.setProcessing(msg.channelId);
        queued.forEach(m => this.forwardToOpenClaw(botId!, m));
      }
    });

    ws.on('close', () => {
      if (botId) {
        this.openclawClients.delete(botId);
        console.log(`OpenClaw client ${botId} disconnected`);
      }
    });
  }

  private setupRoutes(): void {
    this.app.post('/api/ai-models', (req: any, res: any) => {
      const model = { ...req.body, id: randomBytes(8).toString('hex') };
      this.aiModels.push(model);
      const config = existsSync(CONFIG_FILE) ? JSON.parse(readFileSync(CONFIG_FILE, 'utf-8')) : {};
      config.aiModels = this.aiModels;
      writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
      res.json(model);
    });

    this.app.get('/api/ai-models', (req: any, res: any) => {
      res.json(this.aiModels);
    });

    this.app.delete('/api/ai-models/:id', (req: any, res: any) => {
      this.aiModels = this.aiModels.filter(m => m.id !== req.params.id);
      const config = existsSync(CONFIG_FILE) ? JSON.parse(readFileSync(CONFIG_FILE, 'utf-8')) : {};
      config.aiModels = this.aiModels;
      writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
      res.json({ success: true });
    });

    this.app.post('/api/config', (req: any, res: any) => {
      const { bots } = req.body;
      const tokens = bots.map((bot: any) => {
        let token = this.tokens.get(bot.botId);
        if (!token) {
          token = randomBytes(32).toString('hex');
          this.tokens.set(bot.botId, token);
        }
        return { botId: bot.botId, token };
      });

      writeFileSync(CONFIG_FILE, JSON.stringify({ bots, tokens: Array.from(this.tokens.entries()) }, null, 2));
      this.startChannel({ bots });
      res.json({ tokens });
    });

    this.app.get('/api/config', (req: any, res: any) => {
      if (existsSync(CONFIG_FILE)) {
        const config = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
        config.connected = this.channel !== null;
        res.json(config);
      } else {
        res.json({ bots: [], connected: false });
      }
    });

    this.app.post('/api/disconnect', (req: any, res: any) => {
      if (this.channel) {
        this.channel = null;
        this.broadcast({ type: 'disconnected' });
      }
      res.json({ success: true });
    });

    this.app.post('/api/connect', (req: any, res: any) => {
      const { botId, discordToken } = req.body;
      this.startChannel({ bots: [{ botId, discordToken }] });
      res.json({ success: true });
    });

    this.app.post('/api/disconnect-bot', (req: any, res: any) => {
      const { botId } = req.body;
      this.broadcast({ type: 'disconnected', botId });
      res.json({ success: true });
    });
  }

  private startChannel(config: any): void {
    this.channel = new BeanChannel(config);
    this.channel.onMessage(async (botId, msg) => {
      this.messageHistory.addMessage(msg.channelId, msg);
      this.broadcast({ ...msg, botId });

      const botConfig = config.bots.find((b: any) => b.botId === botId);
      const filter = botConfig?.topicFilter || { mode: 'keyword', keywords: [] };

      if (filter.mode === 'keyword') {
        const matched = filter.keywords.some((k: string) => msg.content.toLowerCase().includes(k.toLowerCase()));
        if (matched) {
          this.forwardToOpenClaw(botId, msg);
        } else {
          this.broadcast({ type: 'topic_filtered', botId, content: msg.content });
        }
        return;
      }

      const session = this.sessionManager.getOrCreateSession(msg.channelId);
      if (session.status === 'processing') {
        session.queue.push(msg);
        this.broadcast({ type: 'queued', botId, content: msg.content });
        return;
      }

      session.messages.push(msg);
      this.sessionManager.setProcessing(msg.channelId);
      this.forwardToOpenClaw(botId, msg);
    });

    config.bots.forEach((bot: any) => {
      this.broadcast({ type: 'connected', botId: bot.botId });
    });
  }

  private forwardToOpenClaw(botId: string, msg: any): void {
    const client = this.openclawClients.get(botId);
    if (client && client.readyState === 1) {
      client.send(JSON.stringify({ ...msg, botId }));
    }
  }

  private broadcast(data: any): void {
    this.wss.clients.forEach(client => {
      if (client.readyState === 1) {
        const isOpenClawClient = Array.from(this.openclawClients.values()).includes(client);
        if (!isOpenClawClient) {
          client.send(JSON.stringify(data));
        }
      }
    });
  }

  private loadConfig(): void {
    if (existsSync(CONFIG_FILE)) {
      const config = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
      if (config.aiModels) {
        this.aiModels = config.aiModels;
      }
      if (config.tokens) {
        this.tokens = new Map(config.tokens);
      }
      if (config.bots?.length > 0) {
        this.startChannel(config);
      }
    }
  }

  start(): void {
    console.log(`Config server: http://localhost:${this.port}`);
  }
}

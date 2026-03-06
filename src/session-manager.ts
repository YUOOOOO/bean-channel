import { ChannelMessage } from './types.js';

export interface Session {
  id: string;
  channelId: string;
  status: 'idle' | 'processing' | 'waiting';
  messages: ChannelMessage[];
  queue: ChannelMessage[];
  startTime: number;
  lastActivityTime: number;
  processingStartTime?: number;
}

export class SessionManager {
  private sessions = new Map<string, Session>();
  private timeWindow = 5000; // 5秒时间窗口
  private sessionTimeout = 300000; // 5分钟超时

  getOrCreateSession(channelId: string): Session {
    if (!this.sessions.has(channelId)) {
      this.sessions.set(channelId, {
        id: channelId,
        channelId,
        status: 'idle',
        messages: [],
        queue: [],
        startTime: Date.now(),
        lastActivityTime: Date.now()
      });
    }
    return this.sessions.get(channelId)!;
  }

  addMessage(channelId: string, msg: ChannelMessage): void {
    const session = this.getOrCreateSession(channelId);
    session.messages.push(msg);
    session.lastActivityTime = Date.now();
  }

  addToQueue(channelId: string, msg: ChannelMessage): void {
    const session = this.getOrCreateSession(channelId);
    session.queue.push(msg);
    session.lastActivityTime = Date.now();
  }

  setProcessing(channelId: string): void {
    const session = this.getOrCreateSession(channelId);
    session.status = 'processing';
    session.processingStartTime = Date.now();
  }

  setIdle(channelId: string): void {
    const session = this.getOrCreateSession(channelId);
    session.status = 'idle';
    session.processingStartTime = undefined;
  }

  shouldCancelAndRegenerate(channelId: string): boolean {
    const session = this.sessions.get(channelId);
    if (!session || !session.processingStartTime) return false;

    const elapsed = Date.now() - session.processingStartTime;
    return elapsed < this.timeWindow && session.queue.length > 0;
  }

  getQueuedMessages(channelId: string): ChannelMessage[] {
    const session = this.sessions.get(channelId);
    if (!session) return [];

    const queued = [...session.queue];
    session.queue = [];
    return queued;
  }

  isSessionActive(channelId: string): boolean {
    const session = this.sessions.get(channelId);
    if (!session) return false;

    const elapsed = Date.now() - session.lastActivityTime;
    return elapsed < this.sessionTimeout;
  }

  cleanupExpiredSessions(): void {
    for (const [channelId, session] of this.sessions.entries()) {
      if (!this.isSessionActive(channelId)) {
        this.sessions.delete(channelId);
      }
    }
  }
}

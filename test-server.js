import express from 'express';
import { WebSocketServer } from 'ws';
import { randomBytes } from 'crypto';
import { writeFileSync, readFileSync, existsSync } from 'fs';

const app = express();
const CONFIG_FILE = 'config.json';

app.use(express.json());
app.use(express.static('public'));

const tokens = new Map();

app.post('/api/config', (req, res) => {
  const { bots } = req.body;
  const result = bots.map((bot) => {
    let token = tokens.get(bot.botId);
    if (!token) {
      token = randomBytes(32).toString('hex');
      tokens.set(bot.botId, token);
    }
    return { botId: bot.botId, token };
  });

  writeFileSync(CONFIG_FILE, JSON.stringify({ bots, tokens: Array.from(tokens.entries()) }, null, 2));
  res.json({ tokens: result });
});

app.get('/api/config', (req, res) => {
  if (existsSync(CONFIG_FILE)) {
    res.json(JSON.parse(readFileSync(CONFIG_FILE, 'utf-8')));
  } else {
    res.json({ bots: [] });
  }
});

const server = app.listen(3000, () => {
  console.log('Config server: http://localhost:3000');
  console.log('Note: Discord connection requires Node 18+');
});

const wss = new WebSocketServer({ server, path: '/ws' });

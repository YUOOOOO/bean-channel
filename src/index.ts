import { BeanChannel } from './channel.js';
import { ConfigServer } from './config-server.js';
import { readFileSync, existsSync } from 'fs';

export default function createPlugin(config: any) {
  const configServer = new ConfigServer(config.port || 3000);
  configServer.start();

  let channel: BeanChannel | null = null;

  const loadChannel = () => {
    if (existsSync('config.json')) {
      const cfg = JSON.parse(readFileSync('config.json', 'utf-8'));
      if (cfg.bots?.length > 0) {
        channel = new BeanChannel(cfg);
        console.log('Bean Channel loaded with', cfg.bots.length, 'bots');
      }
    }
  };

  loadChannel();

  return {
    name: 'bean-channel',

    async start(context: any) {
      console.log('Bean Channel plugin started');

      if (channel) {
        channel.onMessage((botId, msg) => {
          context.emit('message', {
            botId,
            channelId: msg.channelId,
            userId: msg.userId,
            content: msg.content,
            timestamp: msg.timestamp,
            type: msg.type
          });
        });
      }
    },

    async sendMessage(botId: string, channelId: string, content: string) {
      if (channel) {
        await channel.sendMessage(botId, channelId, content);
      }
    }
  };
}

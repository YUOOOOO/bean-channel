import { DiscordAdapter } from './discord.js';
import { BotConfig, ChannelMessage } from './types.js';

export class BeanChannel {
  private adapters = new Map<string, DiscordAdapter>();
  private messageHandler?: (botId: string, msg: ChannelMessage) => void;

  constructor(config: { bots: BotConfig[] }) {
    config.bots.forEach(bot => {
      const adapter = new DiscordAdapter(bot.botId, bot.discordToken);
      adapter.onMessage((msg) => {
        if (this.messageHandler) {
          this.messageHandler(bot.botId, msg);
        }
      });
      this.adapters.set(bot.botId, adapter);
    });
  }

  onMessage(handler: (botId: string, msg: ChannelMessage) => void): void {
    this.messageHandler = handler;
  }

  async sendMessage(botId: string, channelId: string, content: string): Promise<void> {
    const adapter = this.adapters.get(botId);
    if (adapter) {
      await adapter.send(channelId, content);
    }
  }
}

import { Client, GatewayIntentBits, Message as DiscordMessage, Partials } from 'discord.js';
import { ChannelMessage, ChannelAdapter } from './types.js';

export class DiscordAdapter implements ChannelAdapter {
  private client: Client;
  private callback?: (msg: ChannelMessage) => void;

  constructor(private botId: string, token: string) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
      ],
      partials: [Partials.Channel]
    });
    this.setup(token);
  }

  private setup(token: string): void {
    this.client.on('ready', () => {
      console.log(`[${this.botId}] Connected to Discord as ${this.client.user?.tag}`);
    });

    this.client.on('messageCreate', (msg: DiscordMessage) => {
      if (msg.author.id === this.client.user?.id) {
        return;
      }
      if (!this.callback) {
        return;
      }

      this.callback({
        id: msg.id,
        channelId: msg.channelId,
        userId: msg.author.id,
        username: msg.author.username,
        content: msg.content,
        timestamp: msg.createdTimestamp,
        type: this.getMessageType(msg)
      });
    });

    this.client.on('error', (error) => {
      console.error(`[${this.botId}] Discord error:`, error);
    });

    this.client.login(token).catch(err => {
      console.error(`[${this.botId}] Login failed:`, err.message);
    });
  }

  private getMessageType(msg: DiscordMessage): 'dm' | 'mention' | 'text' {
    if (msg.channel.isDMBased()) return 'dm';
    if (msg.mentions.users.size > 0) return 'mention';
    return 'text';
  }

  async send(channelId: string, content: string): Promise<void> {
    const channel = await this.client.channels.fetch(channelId);
    if (channel?.isTextBased() && 'send' in channel) {
      await channel.send(content);
    }
  }

  onMessage(callback: (msg: ChannelMessage) => void): void {
    this.callback = callback;
  }
}

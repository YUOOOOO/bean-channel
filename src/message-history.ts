import { ChannelMessage } from './types.js';

export class MessageHistoryManager {
  private histories = new Map<string, ChannelMessage[]>();
  private maxHistorySize = 100;

  addMessage(channelId: string, msg: ChannelMessage): void {
    if (!this.histories.has(channelId)) {
      this.histories.set(channelId, []);
    }

    const history = this.histories.get(channelId)!;
    history.push(msg);

    if (history.length > this.maxHistorySize) {
      history.shift();
    }
  }

  getRecentMessages(channelId: string, count: number): ChannelMessage[] {
    const history = this.histories.get(channelId);
    if (!history) return [];
    return history.slice(-count);
  }
}

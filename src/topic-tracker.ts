export class TopicMatchTracker {
  private matched = new Map<string, boolean>();

  isFirstMatch(botId: string, channelId: string): boolean {
    const key = `${botId}:${channelId}`;
    if (this.matched.has(key)) {
      return false;
    }
    this.matched.set(key, true);
    return true;
  }
}

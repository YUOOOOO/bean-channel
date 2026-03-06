export interface ChannelMessage {
  id: string;
  channelId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  type: 'dm' | 'mention' | 'text';
}

export interface AIModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'custom';
  baseUrl?: string;
  apiKey: string;
  model: string;
  timeout: number;
}

export interface TopicFilter {
  mode: 'keyword' | 'ai';
  keywords: string[];
  aiSettings?: {
    role: string;
    modelId: string;
  };
}

export interface BotConfig {
  botId: string;
  discordToken: string;
  topicFilter: TopicFilter;
}

export interface ChannelAdapter {
  send(channelId: string, content: string): Promise<void>;
  onMessage(callback: (msg: ChannelMessage) => void): void;
}

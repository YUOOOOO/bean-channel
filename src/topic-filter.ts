import nodeFetch from 'node-fetch';
import { TopicFilter, AIModelConfig, ChannelMessage } from './types.js';

const fetch = globalThis.fetch || nodeFetch;

export class TopicFilterService {
  constructor(private aiModels: AIModelConfig[] = []) {}

  async isMessageRelated(newMsg: ChannelMessage, recentMessages: ChannelMessage[], modelId: string): Promise<boolean> {
    const model = this.aiModels.find(m => m.id === modelId);
    if (!model || recentMessages.length === 0) return false;

    const context = recentMessages.map(m => `${m.username}: ${m.content}`).join('\n');
    const prompt = `判断以下新消息是否与最近的对话相关：

最近对话：
${context}

新消息：
${newMsg.username}: ${newMsg.content}

只回复 yes 或 no：`;

    try {
      const response = await this.callAI(prompt, model);
      return response.toLowerCase().includes('yes');
    } catch (error) {
      console.error('[TopicFilter] AI 判断失败:', error);
      return false;
    }
  }

  private async callAI(prompt: string, model: AIModelConfig): Promise<string> {
    const url = model.baseUrl || (model.provider === 'openai'
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://api.anthropic.com/v1/messages');

    const headers: any = { 'Content-Type': 'application/json' };
    let body: any;

    if (model.provider === 'openai' || model.provider === 'custom') {
      headers['Authorization'] = `Bearer ${model.apiKey}`;
      body = {
        model: model.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10
      };
    } else {
      headers['x-api-key'] = model.apiKey;
      headers['anthropic-version'] = '2023-06-01';
      body = {
        model: model.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), model.timeout * 1000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();

      if (model.provider === 'openai' || model.provider === 'custom') {
        return data.choices[0].message.content;
      } else {
        return data.content[0].text;
      }
    } finally {
      clearTimeout(timeout);
    }
  }
}

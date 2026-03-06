import WebSocket from 'ws';

// 替换为你的 Bean Channel Token
const BEAN_TOKEN = '0ccadd6fb075331cd9aad5265cd4cafe7d5b9c5ce6fcbe4d8650d192644e86e1';
const BOT_ID = '豆浆';

const ws = new WebSocket('ws://localhost:3000/openclaw');

ws.on('open', () => {
  console.log('已连接到 Bean Channel');

  // 发送认证消息
  ws.send(JSON.stringify({
    token: BEAN_TOKEN
  }));

  console.log('已发送认证信息');
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  console.log('收到消息:', msg);

  // 只回复来自 Discord 用户的消息（type 为 dm, mention 或 text），不回复自己的消息
  if (msg.content && msg.userId && msg.type !== 'openclaw_reply') {
    setTimeout(() => {
      ws.send(JSON.stringify({
        botId: msg.botId,
        channelId: msg.channelId,
        userId: msg.userId,
        content: `收到你的消息: ${msg.content}`,
        timestamp: Date.now(),
        type: 'text'
      }));
      console.log('已发送回复');
    }, 1000);
  }
});

ws.on('error', (error) => {
  console.error('连接错误:', error);
});

ws.on('close', () => {
  console.log('连接已关闭');
});

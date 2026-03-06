import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3000/openclaw');

ws.on('open', () => {
  console.log('Connected!');
  ws.send(JSON.stringify({ token: '0ccadd6fb075331cd9aad5265cd4cafe7d5b9c5ce6fcbe4d8650d192644e86e1' }));
});

ws.on('error', (err) => {
  console.error('Error:', err.message);
});

ws.on('close', () => {
  console.log('Closed');
});

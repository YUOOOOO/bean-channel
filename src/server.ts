import { ConfigServer } from './config-server.js';

const server = new ConfigServer(3000);
server.start();

console.log('Bean Channel Config Server');
console.log('Open: http://localhost:3000');

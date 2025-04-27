
import { WebSocketServer } from 'ws';

export const wss = new WebSocketServer({
	port: 8080,
	host: '127.0.0.1',
});

console.log('WebSocketServer listening at:', wss.address());

wss.on('connection', (ws) => {
	console.log('client connected');
	ws.on('close', () => {
		console.log('client disconnected');
	});
});

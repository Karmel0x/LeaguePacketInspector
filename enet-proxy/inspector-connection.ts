
import WebSocket from 'ws';

export function connectToInspector() {
    const ws = new WebSocket('ws://127.0.0.1:8080');
    console.log('connecting to inspector...');

    ws.on('error', function (error) {
        console.log('cannot connect to inspector');
    });

    ws.on('open', function () {
        console.log('connected to inspector');
        ws.send(JSON.stringify({
            cmd: 'gs',
        }));
    });

    return ws;
}

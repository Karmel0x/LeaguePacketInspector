import WebSocket, { WebSocketServer } from "ws";

export function sendJson(ws: WebSocket, data: any) {
    ws.send(JSON.stringify(data));
}

export function sendToAll(wss: WebSocketServer, data: any) {
    for (let client of wss.clients) {
        client.send(data);
    }
}

export function sendJsonToAll(wss: WebSocketServer, data: any) {
    for (let client of wss.clients) {
        sendJson(client, data);
    }
}

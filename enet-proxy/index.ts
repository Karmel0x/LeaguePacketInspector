import { bufferToArrayBuffer, type PacketLog } from '@repo/gameserver/src/core/logging';
import WebSocket from 'ws';
import { EnetSocketUsingEvents } from "../../../../packages/enetcppjs/src/enet-using-events";
import { connectToInspector } from "./inspector-connection";


const config = {
    port: 5118,
    host: '127.0.0.1',
};

const destConfig = {
    port: 5119,
    host: '127.0.0.1',
};

let ws: WebSocket;

function logPacket(peerNum: number, data: ArrayBuffer, channel: number, direction: 'sent' | 'recv') {
    const packet = Buffer.from(data);
    console.log(direction, 'packet of size', packet.byteLength, 'from', peerNum, 'on channel', channel, 'data:', data);

    if (!ws || ws.readyState !== WebSocket.OPEN)
        return;

    ws.send(JSON.stringify({
        cmd: 'addpacketforall',
        data: {
            channel,
            bytes: packet.toString('hex'),
            //time: performance.now(),
            peers: [peerNum],
            direction,
        } satisfies Partial<PacketLog>,
    }));
}

function main() {
    ws = connectToInspector();

    const server = new EnetSocketUsingEvents();
    server.bind(config.port, config.host);
    console.log('network started on', config.host + ':' + config.port);
    console.log('proxying to', destConfig.host + ':' + destConfig.port);

    const client = new EnetSocketUsingEvents();

    server.on('connect', (peerNum: number) => {
        console.log('server.connect', peerNum);
        client.connect(destConfig.port, destConfig.host);
    });

    server.on('disconnect', (peerNum: number) => {
        console.log('server.disconnect', peerNum);
        client.disconnect(peerNum);
    });

    let blowfishSet = false;
    server.on('receive', (peerNum: number, data: ArrayBuffer, channel: number) => {
        logPacket(peerNum, data, channel, 'recv');

        if (!blowfishSet) {
            server.setBlowfish(peerNum, '17BLOhi6KZsTtldTsizvHg==');
        }

        client.send(peerNum, data, channel);

        if (!blowfishSet) {
            client.setBlowfish(peerNum, '17BLOhi6KZsTtldTsizvHg==');
            blowfishSet = true;
        }
    });

    client.on('receive', (peerNum: number, data: ArrayBuffer, channel: number) => {
        logPacket(peerNum, data, channel, 'sent');
        server.send(peerNum, data, channel);
    });

    ws.on('message', (data: string) => {
        const res = JSON.parse(data);
        //console.log('ws.message', res);

        if (res.cmd === 'sendpacket') {
            console.log('ws.message', res);
            const packet = res.packet as PacketLog;
            if (!packet)
                return;

            const { peers, bytes, channel, direction } = packet;
            if (!bytes)
                return;

            const data = Buffer.from(bytes, 'hex');

            if (direction === 'sent') {
                for (let i = 0; i < peers.length; i++) {
                    const peerNum = peers[i]!;
                    server.send(peerNum, bufferToArrayBuffer(data), channel);
                    //console.log('ws.message', direction, data, 'to', peerNum, 'on channel', channel);
                }
            }
            else if (direction === 'recv') {
                for (let i = 0; i < peers.length; i++) {
                    const peerNum = peers[i]!;
                    client.send(peerNum, bufferToArrayBuffer(data), channel);
                    //console.log('ws.message', direction, data, 'to', peerNum, 'on channel', channel);
                }
            }

        }
    });

}

main();

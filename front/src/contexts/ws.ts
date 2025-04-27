import { toast } from "svelte-sonner";
import { writable } from "svelte/store";
import { ctxPacketsLength, ctxParsedPacket, ctxReplaysLength, ctxWritedPacket, packetList } from "./packet-list";

const wsStates = {
    connected: false,
    gameServerConnected: false,
    addPaused: false,
};

export const ctxWsStates = writable(wsStates);

export class Ws {

    ws?: WebSocket;

    check() {
        const ws = this.ws;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        return ws;
    }

    open() {
        if (this.check()) return;

        const ws = new WebSocket('ws://127.0.0.1:8080');
        this.ws = ws;

        ws.addEventListener('open', () => {
            wsStates.connected = true;
            ctxWsStates.set(wsStates);
            toast.success('connected to packet inspector server');
        });

        ws.addEventListener('close', () => {
            wsStates.connected = false;
            ctxWsStates.set(wsStates);
            toast.warning('disconnected from packet inspector server');
        });

        ws.addEventListener('message', (event) => {
            //console.log('message from server', event.data);
            let res = JSON.parse(event.data);
            if (res.cmd === 'newpacket') {
                if (wsStates.addPaused) return;

                packetList.packets.push(res.packet);
                //packetList.selected.push(res.packet.id);
                return;
            }

            if (res.cmd === 'newpacket2') {
                if (wsStates.addPaused) return;

                packetList.packets.push(res.packet);
                ctxPacketsLength.set(packetList.packets.length);
                return;
            }

            if (res.cmd === 'loadreplaylist') {
                packetList.replays = res.list;
                ctxReplaysLength.set(packetList.replays.length);
                return;
            }

            if (res.cmd === 'endloading') {
                //packetList.selected = packetList.packets.map(item => item.id);
                ctxPacketsLength.set(packetList.packets.length);
                return;
            }

            if (res.cmd === 'game_server_state') {
                wsStates.gameServerConnected = res.connected;
                ctxWsStates.set(wsStates);
                return;
            }

            if (res.cmd === 'parsed_packet') {
                if (res.error) {
                    toast.error('error parsing packet: ' + res.error.message);
                    return;
                }

                ctxParsedPacket.set(res.packet);
                return;
            }

            if (res.cmd === 'writed_packet') {
                if (res.error) {
                    toast.error('error writing packet: ' + res.error.message);
                    return;
                }

                ctxWritedPacket.set(res.packet);
                return;
            }
        });
    }

    close() {
        const ws = this.check();
        if (!ws) return;

        ws.close();
    }

    sendJson(data: object) {
        const ws = this.check();
        if (!ws) return;

        const text = JSON.stringify(data);
        ws.send(text);
    }

    addPause(v: boolean) {
        wsStates.addPaused = v;
        ctxWsStates.set(wsStates);
    }

}

const ws = new Ws();
export default ws;

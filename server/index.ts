
import type { PacketLog } from '@repo/gameserver/src/core/logging';
import Registry from '@repo/network/registry';
import registerPackets from '@repo/packets/register';
import fs from 'fs';
import WebSocket from 'ws';
import _replayreaders from './_replayreaders/index';
import { ReplayRecord } from './_replayreaders/replay-reader';
import { sendJson, sendJsonToAll } from './extended-web-socket';
import packetParser from './packet-parser';
import { wss } from './wss';

const replayDir = '../../../../temp/replays/';

let replayUnpacked: ReplayRecord[];
let connected: Record<string, WebSocket> = {};
let pId = 0;

function sendToGs(data: any) {
	if (connected.gs) {
		sendJson(connected.gs, data);
	}
}

registerPackets();

wss.on('connection', (ws) => {

	if (connected.gs) {
		sendJson(ws, {
			cmd: 'game_server_state',
			connected: true,
		});
	}

	ws.on('close', () => {
		if (ws !== connected.gs) return;

		sendJsonToAll(wss, {
			cmd: 'game_server_state',
			connected: false,
		});
	});

	ws.on('message', (data) => {

		let res = JSON.parse(data as unknown as string);
		console.log(res);

		if (res.cmd === 'gs') {
			connected.gs = ws;

			sendJsonToAll(wss, {
				cmd: 'game_server_state',
				connected: true,
			});
			return;
		}

		if (res.cmd === 'loadpackets') {

			let offset = res.offset || 0;
			if (offset < 0)
				offset = replayUnpacked.length + offset;

			let limit = (res.limit || 2000);
			let packetsearch: string[] = res.packetsearch || [];

			for (let i = offset, l = replayUnpacked.length, ll = 0; i < l && ll < limit; i++) {
				try {
					let packetDetails = packetParser(replayUnpacked[i]!, i + 1);

					if (packetsearch && packetsearch.length) {

						packetsearch = packetsearch.map(v => v.toLowerCase());
						let values = Object.values(packetDetails).map(v => `${v}`.toLowerCase());

						let found = values.some(v => packetsearch.some(v2 => v.includes(v2)));
						if (!found)
							continue;
					}

					sendJson(ws, {
						cmd: 'newpacket',
						packet: packetDetails,
					});
					ll++;
				} catch (e) {
					console.log('error parsing packet', e);
				}
			}

			sendJson(ws, {
				cmd: 'endloading',
			});
			return;
		}

		if (res.cmd === 'loadpackets2') {
			if (!replayUnpacked) {
				console.log('replay not loaded');
				return;
			}

			let start = res.start || 0;
			let end = (res.end || 2000);
			let packetsearch: string[] = res.packetsearch || [];

			for (let i = start, l = replayUnpacked.length, ll = 0; i < l && ll < end; i++) {
				ll++;

				try {
					let packetDetails = packetParser(replayUnpacked[i]!, i + 1);

					if (packetsearch && packetsearch.length) {

						packetsearch = packetsearch.map(v => v.toLowerCase());
						let values = Object.values(packetDetails).map(v => `${v}`.toLowerCase());

						let found = values.some(v => packetsearch.some(v2 => v.includes(v2)));
						if (!found)
							continue;
					}

					sendJson(ws, {
						cmd: 'newpacket',
						packet: packetDetails,
					});

				} catch (e) {
					console.log('error parsing packet', e);
				}
			}

			sendJson(ws, {
				cmd: 'endloading',
			});
			return;
		}

		//else if(res.cmd === 'initialize_client'){
		//	require('./init_client-network')();
		//}
		//else if(res.cmd === 'sendpacket'){
		//	let i = res.Id;
		//	let buffer = replayUnpacked[i].Bytes ? Buffer.from(replayUnpacked[i].Bytes, 'base64') : Buffer.from(replayUnpacked[i].BytesHex.split(' ').join(''), 'hex');
		//	
		//    enet.sendPacket(0, buffer, replayUnpacked[i].Channel);
		//}
		//else if(res.cmd === 'sendpacket_type'){
		//	const packet11 = createPacket(res.name, res.channel);
		//	packet11.partialKey = [ 0x2A, 0x00, 0xFF ];
		//	packet11.clientId = 0;
		//	packet11.playerId = 1;
		//	sendPacket(0, packet11);
		//}

		if (res.cmd === 'sendpacket') {
			sendToGs({
				cmd: 'sendpacket',
				packet: res.packet,
			});
			return;
		}
		if (res.cmd === 'loadreplaylist') {
			if (!fs.existsSync(replayDir)) {
				console.log('replay dir does not exist', replayDir);
			}
			else {
				let replayList = fs.readdirSync(replayDir).filter((value) => {
					return value.endsWith('.json') || value.endsWith('.lrpkt');
				});
				sendJson(ws, {
					cmd: 'loadreplaylist',
					list: replayList,
				});
			}
			return;
		}

		if (res.cmd === 'loadreplayfile') {
			replayUnpacked = _replayreaders(replayDir + res.name);
			return;
		}

		if (res.cmd === 'addpacket' || res.cmd === 'addpacketforall') {
			let packets = res.data;
			if (!Array.isArray(packets))
				packets = [packets];

			for (let i = 0; i < packets.length; i++) {
				let packet = packets[i] as Partial<PacketLog>;
				const { channel, bytes, time, peers, direction } = packet;

				if (!bytes)
					continue;
				let packetDataArray = bytes.split(' ').join('').match(/../g)?.map(h => parseInt(h, 16)) || [];
				const data = new Uint8Array(packetDataArray).buffer;

				let packetDetails: ReplayRecord = {
					channel,
					data,
					size: data.byteLength,
					time: time || 1,
					peers,
				};

				let packetDetails2: ReturnType<typeof packetParser> | undefined = undefined;

				try {
					packetDetails2 = packetParser(packetDetails, ++pId);
				} catch (e) {
					console.log('error parsing packet', e);
				}

				if (res.cmd === 'addpacketforall') {
					sendJsonToAll(wss, {
						cmd: 'newpacket2',
						packet: {
							...packetDetails,
							...packetDetails2,
							bytes,
							direction,
						},
					});
				}
				else {
					sendJson(ws, {
						cmd: 'newpacket2',
						packet: {
							...packetDetails,
							...packetDetails2,
							bytes,
							direction,
						},
					});
				}
			}
			return;
		}

		if (res.cmd === 'parse_packet') {
			const { channel, bytes } = res.packet as Partial<PacketLog>;
			if (!bytes)
				return;

			try {
				let packetDataArray = bytes.split(' ').join('').match(/../g)?.map(h => parseInt(h, 16)) || [];
				const data = new Uint8Array(packetDataArray).buffer;

				let packetDetails: ReplayRecord = {
					channel,
					data,
					size: data.byteLength,
					time: 1,
					peers: [],
				};

				let packetDetails2 = packetParser(packetDetails, ++pId);

				sendJson(ws, {
					cmd: 'parsed_packet',
					packet: {
						...packetDetails2,
						bytes,
					},
				});
			} catch (e) {
				if (e instanceof Error) {
					sendJson(ws, {
						cmd: 'parsed_packet',
						error: {
							message: e.message,
						},
					});
				}
			}
			return;
		}

		if (res.cmd === 'write_packet') {
			try {
				const { channel, parsed } = res.packet as Partial<PacketLog>;
				if (channel === undefined || !parsed)
					return;

				const parsed2 = JSON.parse(parsed);
				const packetId = parsed2.cmd;
				const registry = Registry.getPacketRegistry(channel, packetId);
				const packetClass = registry.packets[`${channel}-${packetId}`];
				if (!packetClass)
					return;

				const packet1 = packetClass.create(parsed2);
				if (!packet1)
					return;

				const bytes = Buffer.from(packet1.data).toString('hex');

				sendJson(ws, {
					cmd: 'writed_packet',
					packet: {
						channel,
						bytes,
					},
				});
			} catch (e) {
				if (e instanceof Error) {
					sendJson(ws, {
						cmd: 'writed_packet',
						error: {
							message: e.message,
						},
					});
				}
			}
			return;
		}
	});
});
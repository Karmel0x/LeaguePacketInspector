// tsx game-emulator/index.ts <replay_file> [host:port]

import { bufferToArrayBuffer } from '@repo/gameserver/src/core/logging';
import Timer from '@repo/gameserver/src/core/timer';
import { delay } from '@repo/gameserver/src/core/utils';
import { channels } from '@repo/packets/channels';
import '@repo/packets/register';
import repl from 'repl';
import NetworkApiEnet from '@repo/network/network-api/enet';
import _replayreaders from '../server/_replayreaders/index';

const replayDir = '../../temp/replays/';
let replayName = process.argv[2] || (replayDir + 'LOL-REPLAY.rlp.json');
let replayUnpacked = _replayreaders(replayName);
console.log('replay:', replayName);

let destHost = '127.0.0.1';
let destPort = 5119;
if (process.argv[3]) {
	const parts = process.argv[3].split(':');
	destHost = parts[0]!;
	destPort = parseInt(parts[1]!) || 5119;
}

const blowfishKey = '17BLOhi6KZsTtldTsizvHg==';

function getC2SPackets() {
	return replayUnpacked.filter(packet => {
		if (!packet.data) return false;
		if (packet.direction === 'sent') return false; // skip S2C
		return true;
	});
}

const timer = new Timer().notYet();
const c2sPackets = getC2SPackets();

console.log('total packets:', replayUnpacked.length, 'C2S packets:', c2sPackets.length);
console.log('destination:', destHost + ':' + destPort);

function logPacket(peerNum: number, data: ArrayBufferLike, channel: number, direction: 'sent' | 'recv') {
	const packet = Buffer.from(data);
	console.log(direction, 'packet of size', packet.byteLength, 'from peer', peerNum, 'on channel', channel);
}

const peerSockets = new Map<number, NetworkApiEnet>();
const peerConnectedNum = new Map<number, number>();
const peerConnecting = new Map<number, Promise<void>>();

function connectPeer(replayPeer: number): Promise<void> {
	if (peerConnectedNum.has(replayPeer))
		return Promise.resolve();

	if (peerConnecting.has(replayPeer))
		return peerConnecting.get(replayPeer)!;

	const promise = new Promise<void>((resolve) => {
		const socket = new NetworkApiEnet();
		peerSockets.set(replayPeer, socket);

		socket.on('connect', (peerNum: number) => {
			console.log('connected to server, replay peer:', replayPeer, 'enet peerNum:', peerNum);
			peerConnectedNum.set(replayPeer, peerNum);
			resolve();
		});

		socket.on('receive', (peerNum: number, data: ArrayBuffer, channel: number) => {
			logPacket(peerNum, data, channel, 'recv');
		});

		socket.on('disconnect', (peerNum: number) => {
			console.log('disconnected, replay peer:', replayPeer, 'enet peerNum:', peerNum);
		});

		console.log('connecting replay peer:', replayPeer, 'to', destHost + ':' + destPort);
		socket.connect(destPort, destHost);
	});

	peerConnecting.set(replayPeer, promise);
	return promise;
}

const blowfishSet = new Set<number>();

async function sendToSocket(replayPeer: number, data: ArrayBufferLike, channel: number) {
	await connectPeer(replayPeer);
	const socket = peerSockets.get(replayPeer)!;
	const peerNum = peerConnectedNum.get(replayPeer)!;
	socket.send(peerNum, data, channel);
	logPacket(peerNum, data, channel, 'sent');

	// Set blowfish after sending first packet (KeyCheck) for this peer
	if (!blowfishSet.has(replayPeer)) {
		blowfishSet.add(replayPeer);
		socket.setBlowfish(peerNum, blowfishKey);
		console.log('blowfish set for replay peer:', replayPeer);
	}
}

async function startReplay() {
	timer.start();

	console.log('starting replay, C2S packet count:', c2sPackets.length);
	for (let i = 0; i < c2sPackets.length; i++) {
		let packet = c2sPackets[i]!;

		if (!packet.time) {
			continue;
		}

		while (timer.now() < packet.time) {
			await delay(1);
		}

		const channel = packet.channel ?? channels.c2s;

		if (packet.peers && packet.peers.length > 0) {
			for (const replayPeer of packet.peers) {
				await sendToSocket(replayPeer, packet.data, channel);
			}
		}

		if (i % 100 === 0)
			console.log('packet number:', i);
	}

	console.log('replay finished');
}

async function main() {
	startReplay();
}

main();

if (repl.start) {
	console.log('available commands: .speed <num>, .pause, .resume, .timer, .send [<channel>] <hex>');

	const local = repl.start('> ');

	local.on('exit', () => {
		process.exit(0);
	});

	local.defineCommand('speed', {
		help: 'set speed',
		action(input) {
			this.clearBufferedCommand();

			let speed = parseFloat(input);
			timer.speedUp(speed);
			console.log('speed:', speed);

			this.displayPrompt();
		},
	});

	local.defineCommand('pause', {
		help: 'pause',
		action(input) {
			this.clearBufferedCommand();

			timer.pause();
			console.log('paused');

			this.displayPrompt();
		},
	});

	local.defineCommand('resume', {
		help: 'resume',
		action(input) {
			this.clearBufferedCommand();

			timer.resume();
			console.log('resumed');

			this.displayPrompt();
		},
	});

	local.defineCommand('timer', {
		help: 'timer',
		action(input) {
			this.clearBufferedCommand();

			let s = Math.round(timer.now()) / 1000;
			console.log('timer:', s);

			this.displayPrompt();
		},
	});

	local.defineCommand('send', {
		help: 'send [<channel>] <hex>',
		action(input) {
			this.clearBufferedCommand();
			if (!input || input.length < 2) return;

			let channel = channels.c2s;
			if (input[1] === ' ') {
				channel = parseInt(input[0]!);
				input = input.slice(2);
			}

			input = input.replaceAll(' ', '').replaceAll('-', '');
			let packet = Buffer.from(input, 'hex');
			for (const [replayPeer, socket] of peerSockets) {
				const peerNum = peerConnectedNum.get(replayPeer);
				if (peerNum !== undefined) {
					socket.send(peerNum, bufferToArrayBuffer(packet), channel);
				}
			}

			console.log('sent', packet.length, 'bytes to channel', channel);

			this.displayPrompt();
		},
	});

	local.defineCommand('wait', {
		help: 'wait',
		action(input) {
			this.clearBufferedCommand();

			let ms = parseInt(input);
			if (!ms) return;

			setTimeout(() => {
				this.displayPrompt();
			}, ms);
		},
	});

}


import { PacketLog } from '@repo/gameserver/src/core/logging';
import { PacketDebugger } from '@repo/network/packets/packet';
import Parser from '@repo/network/parser';
import RelativeDataView from '@repo/network/relative-data-view';
import { channels } from '@repo/packets/channels';
import * as packets from '@repo/packets/list';
import '@repo/packets/register';
import { ReplayRecord } from './_replayreaders/replay-reader';


export default function packetParser(packet1: ReplayRecord, i: number) {
	if (!packet1.data)
		throw new Error('packet data is empty');
	if (packet1.channel === undefined)
		throw new Error('packet channel is undefined');

	let packetData = packet1.data;
	let dvr = RelativeDataView.from(packetData);

	let packetId = dvr.readUint8();

	//if (packetId === packets.Ping_Load_InfoS2C.id)
	//	throw new Error('packet Ping_Load_InfoS2C skipped');
	if (packetId === 0xFF)
		throw new Error('batched packet not implemented');
	//if (packet1.channel === 0)
	//	throw new Error('channel default skipped');
	if (packetId === packets.AddListener.id)
		throw new Error('packet AddListener skipped');

	let packetClass = Parser.getPacketClass(packet1.channel, packetId);
	let channel = packet1.channel ?? packetClass?.channel ?? -1;
	let packetName = packetClass?.name || '';

	let bytes = Buffer.from(packetData).toString('hex');
	let parsed = Parser.parse({
		channel,
		data: packetData,
	});
	let debugOffsets = PacketDebugger.offsets;

	let parsedJson = JSON.stringify(parsed, (key, value) => typeof value === "bigint" ? `${value}n` : value, 2);
	let debugOffsetsJson = JSON.stringify(debugOffsets, undefined, 2);

	let packetDetails = {
		id: i,
		time: packet1.time,
		packet: packetId,
		channel,
		bytes,
		size: bytes.length,
		parsed: parsedJson,
		debugOffsets: debugOffsetsJson,
		peers: packet1.peers || [],
		channelName: channels[channel] || '',
		packetName,
	} satisfies Omit<PacketLog, 'direction'>;

	return packetDetails;
}

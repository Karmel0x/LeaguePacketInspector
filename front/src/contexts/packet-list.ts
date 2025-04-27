import { writable } from "svelte/store";

export type PacketLog = {
    id: number;
    time: number;
    direction: 'sent' | 'recv';
    peers: number[];
    size: number;
    channel: number;
    channelName: number;
    packet: number;
    packetName: number;

    parsed?: string;
    bytes?: string;
    debugOffsets: string;
};

export const packetList = {
    replays: [] as string[],
    packets: [] as PacketLog[],
    selected: [] as PacketLog[],
};

export const ctxReplaysLength = writable(0);
export const ctxPacketsLength = writable(0);
export const ctxSelectedLength = writable(0);

export const ctxParsedPacket = writable<PacketLog | undefined>(undefined);
export const ctxWritedPacket = writable<Pick<PacketLog, 'channel' | 'bytes'> | undefined>(undefined);

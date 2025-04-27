
export type ReplayRecord = {
    time: number;
    peers?: number[];
    channel?: number;
    size: number;
    data: ArrayBuffer;
};

export type ReplayFileRecord = ReplayRecord & {
    data?: ArrayBuffer;
    dataBase64?: string;
    dataHex?: string;
};

export interface ReplayFileReader {
    (filePath: string): ReplayFileRecord[];
}

export interface ReplayReader {
    (filePath: string): ReplayRecord[];
}

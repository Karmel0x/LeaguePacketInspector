
export function formatTime(ms: number): string {
    const seconds = ms / 1000;
    const hours = Math.floor(seconds / 3600);
    const minutes = `${Math.floor((seconds % 3600) / 60)}`.padStart(2, '0');
    const secondsPart = `${Math.floor(seconds % 60)}`.padStart(2, '0');
    return `${hours > 0 ? `${hours}:` : ''}${minutes}:${secondsPart}`;
}

export function formatTimeFull(ms: number): string {
    const seconds = ms / 1000;
    const hours = `${Math.floor(seconds / 3600)}`.padStart(2, '0');
    const minutes = `${Math.floor((seconds % 3600) / 60)}`.padStart(2, '0');
    const secondsPart = (seconds % 60).toFixed(3).padStart(6, '0');
    return `${hours}:${minutes}:${secondsPart}`;
}


export function formatSizeAuto(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let size = bytes;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    let resultSize = size.toFixed(2).replace('.00', '');
    return `${resultSize} ${units[unitIndex]}`;
}
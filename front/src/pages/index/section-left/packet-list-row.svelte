<script lang="ts">
    import { formatSizeAuto, formatTime, formatTimeFull } from "$lib/utils2";
    import ArrowDown from "lucide-svelte/icons/arrow-down";
    import ArrowUp from "lucide-svelte/icons/arrow-up";
    import type { PacketLog } from "../../../contexts/packet-list";

    export let item: PacketLog;
</script>

<div class="flex items-center text-center">
    <div class="grow basis-0 border-r">
        <div class="">
            <span>{item.id}</span>
        </div>
    </div>
    <div class="grow basis-0 border-r">
        <div class="">
            <span
                class="text-neutral-400 text-sm"
                title={formatTimeFull(item.time)}>{formatTime(item.time)}</span
            >
        </div>
    </div>
    <div class="grow basis-0 border-r">
        <div class="">
            {#if item.direction === "sent"}
                <span>
                    <ArrowUp size={14} class="p-px bg-blue-800 inline-block" />
                </span>
            {:else if item.direction === "recv"}
                <span>
                    <ArrowDown
                        size={14}
                        class="p-px bg-orange-800 inline-block"
                    />
                </span>
            {:else}
                <span title={`${item.direction}`} class="bg-pink-700 px-1"
                    >?</span
                >
            {/if}
            <span>
                {#if item.peers}
                    {item.peers}
                {/if}
            </span>
        </div>
    </div>
    <div class="grow basis-0">
        <div class="">
            <span class="text-neutral-400 text-sm"
                >{formatSizeAuto(item.size)}</span
            >
        </div>
    </div>
</div>
<div class="px-2 text-sm text-neutral-400 flex justify-between gap-2">
    <span>{item.channelName || item.channel}</span>
    <span>{item.packetName || item.packet}</span>
</div>

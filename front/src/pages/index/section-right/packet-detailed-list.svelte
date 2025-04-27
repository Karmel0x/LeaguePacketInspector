<script lang="ts">
    import Loading from "$lib/components2/loading.svelte";
    import {
        ctxSelectedLength,
        packetList,
        type PacketLog,
    } from "../../../contexts/packet-list";
    import PacketDetailedListRow from "./packet-detailed-list-row.svelte";

    let selected: PacketLog[];
    $: if ($ctxSelectedLength !== undefined) selected = packetList.selected;

    let loaded: any[] = [];
    async function fetchData(id: number) {
        if (loaded[id]) return loaded[id];
        await new Promise((resolve) =>
            setTimeout(() => resolve(undefined), 1000),
        );

        let hex = `11`;
        let json = `{"aa":"asd"}`;
        let data = { hex, json };
        loaded[id] = data;
        return data;
    }

    async function f(item: any) {
        return item;
    }
</script>

<div class="px-4 py-1">
    {#each selected as item}
        {@const packet = packetList.packets.find((item2) => item2 === item)}
        {#if packet}
            <div class="mt-3">
                {#await f(packet)}
                    <Loading />
                {:then packet}
                    <PacketDetailedListRow {item} {packet} />
                {/await}
            </div>
        {/if}
    {/each}
</div>

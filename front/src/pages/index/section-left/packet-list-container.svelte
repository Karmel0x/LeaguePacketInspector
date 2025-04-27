<script lang="ts">
    import { cn } from "$lib/utils";
    import {
        ctxPacketsLength,
        ctxSelectedLength,
        packetList,
        type PacketLog,
    } from "../../../contexts/packet-list";
    import VirtualList from "../../../lib/components2/virtual-list.svelte";
    import PacketListRow from "./packet-list-row.svelte";

    let items: PacketLog[];
    $: if ($ctxPacketsLength !== undefined) items = packetList.packets;
    //$: console.log(items);

    //let loaded: any[] = [];
    //async function fetchData(id: number) {
    //    if (loaded[id]) return loaded[id];
    //    await new Promise((resolve) =>
    //        setTimeout(() => resolve(undefined), 1000),
    //    );
    //    let data = "asd";
    //    loaded[id] = data;
    //    return data;
    //}

    function clickSelect(
        item: PacketLog,
        e: MouseEvent & {
            currentTarget: EventTarget & HTMLButtonElement;
        },
    ) {
        console.log(e);
        const selected = packetList.selected;
        const index = selected.indexOf(item);
        if (index === -1) {
            if (e.shiftKey) {
                let lastSelected = selected[selected.length - 1];
                if (lastSelected !== undefined) {
                    const index1 = items.findIndex(
                        (item2) => item2 === lastSelected,
                    );
                    const index2 = items.findIndex((item2) => item2 === item);
                    let start = Math.min(index1, index2);
                    let end = Math.max(index1, index2);
                    for (let i = start; i < end; i++) {
                        const item2 = items[i];
                        selected.push(item2);
                    }
                }
            }

            selected.push(item);
        } else {
            selected.splice(index, 1);
        }

        $ctxSelectedLength = selected.length;
    }
</script>

<div class="flex flex-col gap-2 h-full">
    <div class="h-full w-full rounded-md border flex flex-col">
        {#if items.length}
            <div
                class="flex items-center text-neutral-300"
                style="scrollbar-gutter: stable;overflow:hidden;scrollbar-width: thin"
            >
                <div class="grow basis-0 border-r h-7">
                    <button class="w-full hover:bg-neutral-800">id</button>
                </div>
                <div class="grow basis-0 border-r h-7">
                    <button class="w-full hover:bg-neutral-800">time</button>
                </div>
                <div class="grow basis-0 border-r h-7">
                    <button class="w-full hover:bg-neutral-800">peers</button>
                </div>
                <div class="grow basis-0 h-7">
                    <button class="w-full hover:bg-neutral-800">size</button>
                </div>
            </div>
            <div class="grow min-h-0">
                <VirtualList {items} itemHeight={45}>
                    <button
                        slot="item"
                        let:item
                        let:index
                        class="border-b block w-full text-start hover:bg-neutral-800"
                        on:click={(e) => clickSelect(item, e)}
                    >
                        <div
                            class={cn(
                                $ctxSelectedLength !== undefined &&
                                    packetList.selected.includes(item)
                                    ? "bg-neutral-700/70"
                                    : undefined,
                            )}
                        >
                            <PacketListRow {item} />
                        </div>
                    </button>
                </VirtualList>
            </div>
        {/if}
    </div>
</div>

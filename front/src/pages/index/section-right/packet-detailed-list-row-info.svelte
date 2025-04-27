<script lang="ts">
    import { buttonVariants } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { cn } from "$lib/utils";
    import { formatSizeAuto, formatTime, formatTimeFull } from "$lib/utils2";
    import ArrowDown from "lucide-svelte/icons/arrow-down";
    import ArrowUp from "lucide-svelte/icons/arrow-up";
    import { toast } from "svelte-sonner";
    import type { PacketLog } from "../../../contexts/packet-list";
    import ws from "../../../contexts/ws";
    import PacketEditAndResend from "./packet-edit-and-resend.svelte";

    export let item: PacketLog;
    let editAndResend: PacketLog | undefined = undefined;
</script>

<div class="flex items-center text-center">
    <div class="w-16 border-r">
        <div class="">
            <span>{item.id}</span>
        </div>
    </div>
    <div class="w-14 border-r">
        <div class="">
            <span
                class="text-neutral-400 text-sm"
                title={formatTimeFull(item.time)}>{formatTime(item.time)}</span
            >
        </div>
    </div>
    <div class="w-16 border-r">
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
    <div class="w-16">
        <div class="">
            <span class="text-neutral-400 text-sm"
                >{formatSizeAuto(item.size)}</span
            >
        </div>
    </div>
</div>
<div class="flex items-center gap-2 px-2 text-sm text-neutral-400">
    <span class="border-l ps-2">{item.channelName || item.channel}</span>
    <span class="border-l ps-2">{item.packetName || item.packet}</span>
</div>
<div>
    <DropdownMenu.Root>
        <DropdownMenu.Trigger
            class={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >. . .</DropdownMenu.Trigger
        >
        <DropdownMenu.Content>
            <DropdownMenu.Group>
                <DropdownMenu.Label>Packet #{item.id}</DropdownMenu.Label>
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                    class="cursor-pointer"
                    on:click={() => {
                        console.log("resend", item);
                        if (!item.direction) {
                            toast.error("packet has no direction");
                            return;
                        }
                        if (!item.bytes || item.bytes.length < 2) {
                            toast.error("incorrect packet data");
                            return;
                        }

                        ws.sendJson({
                            cmd: "sendpacket",
                            packet: item,
                        });

                        toast.success(`sent packet #${item.id}`);
                    }}>Resend</DropdownMenu.Item
                >
                <DropdownMenu.Item
                    class="cursor-pointer"
                    on:click={() => {
                        editAndResend = item;
                    }}>Edit and resend</DropdownMenu.Item
                >
            </DropdownMenu.Group>
        </DropdownMenu.Content>
    </DropdownMenu.Root>
</div>

<Dialog.Root
    open={!!editAndResend}
    on:openChange={(e) => {
        editAndResend = undefined;
    }}
>
    <Dialog.Content class="max-w-5xl">
        <Dialog.Header>
            {#if !!editAndResend}
                <Dialog.Title>packet #{editAndResend.id}</Dialog.Title>
                <Dialog.Description>
                    <PacketEditAndResend item={editAndResend} />
                </Dialog.Description>
            {/if}
        </Dialog.Header>
    </Dialog.Content>
</Dialog.Root>

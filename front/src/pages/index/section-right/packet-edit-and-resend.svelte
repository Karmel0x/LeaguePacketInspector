<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import ws from "../../../contexts/ws";
    import {
        ctxParsedPacket,
        ctxWritedPacket,
        type PacketLog,
    } from "../../../contexts/packet-list";
    import * as Select from "$lib/components/ui/select";
    import { channels } from "$lib/lol";
    import { toast } from "svelte-sonner";

    export let item: PacketLog;

    let bytes = item.bytes?.match(/../g)?.join(" ") ?? "";
    let parsed = item.parsed ?? "";
    let channel = item.channel;
    let direction = item.direction;

    $: if ($ctxParsedPacket && $ctxParsedPacket.parsed) {
        console.log("ctxParsedPacket", $ctxParsedPacket);
        parsed = $ctxParsedPacket.parsed;
        $ctxParsedPacket = undefined;
    }

    $: if ($ctxWritedPacket && $ctxWritedPacket.bytes) {
        console.log("ctxWritedPacket", $ctxWritedPacket);
        bytes = $ctxWritedPacket.bytes?.match(/../g)?.join(" ") ?? "";
        $ctxWritedPacket = undefined;
    }
</script>

<div>
    <div class="mt-2 flex gap-2">
        <Textarea bind:value={bytes} rows={15}></Textarea>
        <Textarea bind:value={parsed} rows={15}></Textarea>
    </div>
    <div class="mt-2 flex gap-4">
        <div class="grow basis-0">
            <div class="flex gap-2">
                <Select.Root
                    selected={{
                        label: "s2c",
                        value: channels.s2c,
                    }}
                    onSelectedChange={(v) => {
                        if (!v) channel = channels.s2c;
                        else if (typeof v.value === "string")
                            channel = parseInt(v.value);
                        else if (typeof v.value === "number") channel = v.value;
                    }}
                >
                    <Select.Trigger class="w-[180px]">
                        <Select.Value placeholder="Channel" />
                    </Select.Trigger>
                    <Select.Content>
                        {#each Object.entries(channels) as [channel, i]}
                            <Select.Item value={i}>{channel}</Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
                <Button
                    variant="outline"
                    on:click={() => {
                        ws.sendJson({
                            cmd: "parse_packet",
                            packet: {
                                channel,
                                bytes: bytes.replaceAll(" ", ""),
                            },
                        });
                    }}>re-parse</Button
                >
            </div>
        </div>
        <div class="grow basis-0 flex gap-2 justify-between">
            <div class="">
                <Button
                    variant="outline"
                    on:click={() => {
                        try {
                            const parsed2 = JSON.parse(parsed);
                            const parsed3 = JSON.stringify(parsed2);
                            ws.sendJson({
                                cmd: "write_packet",
                                packet: {
                                    channel,
                                    parsed: parsed3,
                                },
                            });
                        } catch (e) {
                            console.error(e);
                            toast.error("failed to parse packet");
                        }
                    }}>re-write</Button
                >
            </div>
            <div class="flex gap-2">
                <Select.Root
                    selected={{
                        label: direction,
                        value: direction,
                    }}
                    onSelectedChange={(v) => {
                        if (!v) direction = "sent";
                        else direction = v.value;
                    }}
                >
                    <Select.Trigger class="w-[180px]">
                        <Select.Value placeholder="direction" />
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Item value="sent">sent</Select.Item>
                        <Select.Item value="recv">recv</Select.Item>
                    </Select.Content>
                </Select.Root>
                <Button
                    on:click={() => {
                        console.log("resend", item);
                        if (!direction) {
                            toast.error("packet has no direction");
                            return;
                        }
                        if (!bytes || bytes.length < 2) {
                            toast.error("incorrect packet data");
                            return;
                        }

                        ws.sendJson({
                            cmd: "sendpacket",
                            packet: {
                                ...item,
                                channel,
                                bytes: bytes.replaceAll(" ", ""),
                                direction,
                            },
                        });

                        toast.success(`sent packet`);
                    }}>send</Button
                >
            </div>
        </div>
    </div>
</div>

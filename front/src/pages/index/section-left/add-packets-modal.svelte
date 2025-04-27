<script lang="ts">
    import { buttonVariants } from "$lib/components/ui/button";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Dialog from "$lib/components/ui/dialog";
    import { cn } from "$lib/utils";
    import { Textarea } from "$lib/components/ui/textarea";
    import ws from "../../../contexts/ws";
    import * as Select from "$lib/components/ui/select";
    import { channels } from "$lib/lol";

    function addpacket(packetInputList: string, packetInputChannel: number) {
        let packets = packetInputList
            .split(" ")
            .join("")
            .split("\n")
            .map((v) => v.trim())
            .filter(Boolean);

        let packets2 = packets.map((v) => {
            let packetChannel = packetInputChannel;

            let packetInput = v
                .replace("sent:", "s2c:")
                .replace("recv:", "c2s:");
            let packetData = packetInput;

            if (packetInput.includes(":")) {
                let [channelName, data] = packetInput.split(":");
                packetData = data;

                if (channelName) {
                    for (let channel in channels) {
                        let channelId =
                            channels[channel as keyof typeof channels];

                        if (
                            channelName.toLowerCase() ===
                                channel.toLowerCase() ||
                            channelName === `${channelId}`
                        ) {
                            packetChannel = channelId;
                            break;
                        }
                    }
                }
            }
            return {
                channel: packetChannel,
                data: packetData,
            };
        });

        ws.sendJson({
            cmd: "addpacket",
            data: packets2,
        });
    }

    let str = "";
    let channel = channels.s2c;
</script>

<Dialog.Root>
    <Dialog.Trigger
        class={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start")}
        >add packets</Dialog.Trigger
    >
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>add packets</Dialog.Title>
            <Dialog.Description>
                <form
                    action=""
                    on:submit|preventDefault={() => {
                        addpacket(str, channel);
                    }}
                >
                    <div class="mt-2">
                        <Textarea
                            rows={10}
                            placeholder="packets"
                            bind:value={str}
                        />
                    </div>
                    <div class="mt-2">
                        <Select.Root
                            selected={{
                                label: "s2c",
                                value: channels.s2c,
                            }}
                            onSelectedChange={(v) => {
                                if (!v) channel = channels.s2c;
                                else if (typeof v.value === "string")
                                    channel = parseInt(v.value);
                                else if (typeof v.value === "number")
                                    channel = v.value;
                            }}
                        >
                            <Select.Trigger class="w-[180px]">
                                <Select.Value placeholder="Channel" />
                            </Select.Trigger>
                            <Select.Content>
                                {#each Object.entries(channels) as [ch, i]}
                                    <Select.Item value={i}
                                        >{ch}</Select.Item
                                    >
                                {/each}
                            </Select.Content>
                        </Select.Root>
                    </div>

                    <div class="mt-5">
                        <Button type="submit">add packets</Button>
                    </div>
                </form>
            </Dialog.Description>
        </Dialog.Header>
    </Dialog.Content>
</Dialog.Root>

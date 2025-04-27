<script lang="ts">
    import Check from "lucide-svelte/icons/check";
    import FolderOpen from "lucide-svelte/icons/folder-open";
    import FileQuestion from "lucide-svelte/icons/file-question";
    import * as Command from "$lib/components/ui/command/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { cn } from "$lib/utils.js";
    import { tick } from "svelte";
    import {
        ctxReplaysLength,
        packetList,
    } from "../../../contexts/packet-list";
    import ws from "../../../contexts/ws";

    type ListItem = {
        value: string;
        label: string;
    };

    let list: ListItem[];
    $: if ($ctxReplaysLength !== undefined)
        list = packetList.replays.map((v) => ({
            value: v,
            label: v,
        }));

    let open = false;
    let value = "";

    // We want to refocus the trigger button when the user selects
    // an item from the list so users can continue navigating the
    // rest of the form with the keyboard.
    function closeAndFocusTrigger(triggerId: string) {
        open = false;
        tick().then(() => {
            document.getElementById(triggerId)?.focus();
        });
    }
</script>

<Popover.Root bind:open let:ids>
    <Popover.Trigger asChild let:builder>
        <Button
            builders={[builder]}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            class="px-3 h-8"
            on:click={() => {
                ws.sendJson({
                    cmd: "loadreplaylist",
                });
            }}
        >
            <FolderOpen size={20} />
        </Button>
    </Popover.Trigger>
    <Popover.Content class="w-[600px] p-0">
        <Command.Root>
            <Command.Input placeholder="Search..." />
            <Command.Empty>Not found.</Command.Empty>
            <Command.Group>
                {#each list as item}
                    <Command.Item
                        value={item.value}
                        onSelect={(currentValue) => {
                            value = currentValue;
                            closeAndFocusTrigger(ids.trigger);

                            ws.sendJson({
                                cmd: "loadreplayfile",
                                name: item.value,
                            });
                            ws.sendJson({
                                cmd: "loadpackets",
                            });
                        }}
                    >
                        <div class="flex w-full justify-between">
                            <div class="flex">
                                <Check
                                    class={cn(
                                        "mr-2 h-4 w-4",
                                        value !== item.value &&
                                            "text-transparent",
                                    )}
                                />
                                {item.label}
                            </div>

                            <div class="h-5">
                                <Button
                                    variant="ghost"
                                    class="h-5 p-0"
                                    role="button"
                                    on:click={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    <FileQuestion size={20} />
                                </Button>
                            </div>
                        </div>
                    </Command.Item>
                {/each}
            </Command.Group>
        </Command.Root>
    </Popover.Content>
</Popover.Root>

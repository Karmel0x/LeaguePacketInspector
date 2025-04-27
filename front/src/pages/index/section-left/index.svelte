<script lang="ts">
    import { buttonVariants } from "$lib/components/ui/button";
    import Button from "$lib/components/ui/button/button.svelte";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import Input from "$lib/components/ui/input/input.svelte";
    import { Label } from "$lib/components/ui/label";
    import * as Popover from "$lib/components/ui/popover";
    import * as RadioGroup from "$lib/components/ui/radio-group";
    import { cn } from "$lib/utils";
    import ArrowDown from "lucide-svelte/icons/arrow-down";
    import ArrowDownUp from "lucide-svelte/icons/arrow-down-up";
    import ArrowUp from "lucide-svelte/icons/arrow-up";
    import Eraser from "lucide-svelte/icons/eraser";
    import Funnel from "lucide-svelte/icons/funnel";
    import Hammer from "lucide-svelte/icons/hammer";
    import Info from "lucide-svelte/icons/info";
    import Pause from "lucide-svelte/icons/pause";
    import Play from "lucide-svelte/icons/play";
    import Plug from "lucide-svelte/icons/plug";
    import Search from "lucide-svelte/icons/search";
    import Settings from "lucide-svelte/icons/settings";
    import Unplug from "lucide-svelte/icons/unplug";
    import { onMount } from "svelte";
    import {
        ctxPacketsLength,
        ctxSelectedLength,
        packetList,
    } from "../../../contexts/packet-list";
    import ws, { ctxWsStates } from "../../../contexts/ws";
    import AddPacketsModal from "./add-packets-modal.svelte";
    import HashStringModal from "./hash-string-modal.svelte";
    import PacketList from "./packet-list-container.svelte";
    import ReplayCombobox from "./replay-list-combobox.svelte";

    onMount(() => {
        ws.open();
    });
</script>

<div class="h-full flex flex-col gap-2">
    <div>
        <div>
            <ReplayCombobox />
            {#if $ctxWsStates.addPaused}
                <Button
                    variant="outline"
                    size="sm"
                    class={cn(
                        $ctxWsStates.gameServerConnected
                            ? "border-green-600"
                            : "border-red-600",
                    )}
                    on:click={() => {
                        ws.addPause(false);
                    }}><Play size={20} /></Button
                >
            {:else}
                <Button
                    variant="outline"
                    size="sm"
                    class={cn(
                        $ctxWsStates.gameServerConnected
                            ? "border-green-600"
                            : "border-red-600",
                    )}
                    on:click={() => {
                        ws.addPause(true);
                    }}><Pause size={20} /></Button
                >
            {/if}
            {#if $ctxWsStates.connected}
                <Button
                    variant="outline"
                    size="sm"
                    class="border-green-600"
                    on:click={() => {
                        ws.close();
                    }}><Unplug size={20} /></Button
                >
            {:else}
                <Button
                    variant="outline"
                    size="sm"
                    class="border-red-600"
                    on:click={() => {
                        ws.open();
                    }}><Plug size={20} /></Button
                >
            {/if}
            <Button
                variant="outline"
                size="sm"
                disabled={$ctxPacketsLength === 0}
                on:click={() => {
                    packetList.packets = [];
                    $ctxPacketsLength = 0;
                }}><Eraser size={20} /></Button
            >
            <Button
                disabled
                title="not implemented yet"
                variant="outline"
                size="sm"
                on:click={() => {}}><Settings size={20} /></Button
            >
        </div>
        <div class="mt-1">
            <Popover.Root>
                <Popover.Trigger
                    disabled
                    title="not implemented yet"
                    class={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                    )}><Search size={20} /></Popover.Trigger
                >
                <Popover.Content>
                    <Input
                        placeholder="Search..."
                        on:input={(e) => {
                            //$ctxPacketList.search = e.target.value;
                        }}
                    />
                </Popover.Content>
            </Popover.Root>
            <Popover.Root>
                <Popover.Trigger
                    disabled
                    title="not implemented yet"
                    class={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                    )}><Funnel size={20} /></Popover.Trigger
                >
                <Popover.Content>
                    <Input
                        placeholder="Search..."
                        on:input={(e) => {
                            //$ctxPacketList.search = e.target.value;
                        }}
                    />
                    <div class="mt-3"></div>
                    <RadioGroup.Root
                        value="option-one"
                        class="flex items-center gap-3"
                    >
                        <div class="flex items-center space-x-1">
                            <RadioGroup.Item
                                value="option-one"
                                id="option-one"
                            />
                            <Label
                                for="option-one"
                                class="flex items-center gap-1"
                                ><ArrowDownUp size={20} />both</Label
                            >
                        </div>
                        <div class="flex items-center space-x-1">
                            <RadioGroup.Item
                                value="option-two"
                                id="option-two"
                            />
                            <Label
                                for="option-two"
                                class="flex items-center gap-1"
                                ><ArrowUp size={20} />sent</Label
                            >
                        </div>
                        <div class="flex items-center space-x-1">
                            <RadioGroup.Item
                                value="option-three"
                                id="option-three"
                            />
                            <Label
                                for="option-three"
                                class="flex items-center gap-1"
                                ><ArrowDown size={20} />recv</Label
                            >
                        </div>
                    </RadioGroup.Root>

                    <div class="mt-3 flex items-center space-x-1">
                        <Checkbox id="option-four" />
                        <Label for="option-four" class="flex items-center gap-1"
                            >check packet content</Label
                        >
                        <span
                            title="will check parsed data of packet - it will take more time"
                        >
                            <Info size={20} />
                        </span>
                    </div>
                </Popover.Content>
            </Popover.Root>
            <Popover.Root>
                <Popover.Trigger
                    class={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                    )}><Hammer size={20} /></Popover.Trigger
                >
                <Popover.Content class="p-0">
                    <HashStringModal />
                    <div>
                        <Button
                            variant="ghost"
                            class="w-full justify-start"
                            on:click={() => {
                                packetList.selected = [];
                                $ctxSelectedLength = 0;
                            }}>clear selection</Button
                        >
                    </div>
                    <AddPacketsModal />
                </Popover.Content>
            </Popover.Root>
        </div>
    </div>
    <div class="grow min-h-0">
        <PacketList />
    </div>
</div>

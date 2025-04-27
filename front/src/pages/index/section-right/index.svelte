<script>
    import Button from "$lib/components/ui/button/button.svelte";
    import PacketDetailedList from "./packet-detailed-list.svelte";

    let tabs = ["workspace 1"];
</script>

<!--
<div class="ms-2 flex">
    {#each tabs as tab}
        <div class="w-32">
            <Button
                variant="outline"
                size="sm"
                class="w-full border-t-0 rounded-t-none">{tab}</Button
            >
        </div>
    {/each}
    <div class="w-8">
        <Button
            variant="outline"
            size="sm"
            class="w-full border-t-0 rounded-t-none"
            on:click={() => {
                tabs.push(`workspace ${tabs.length + 1}`);
                tabs = tabs;
            }}>+</Button
        >
    </div>
</div>
-->

<PacketDetailedList />

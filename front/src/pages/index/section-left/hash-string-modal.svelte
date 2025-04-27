<script lang="ts" context="module">
    import { writable } from "svelte/store";

    type SavedHashString = {
        stringToHash: string;
        hashString: number;
        hashStringNorm: number;
    };
    let saved = writable<SavedHashString[]>([]);
</script>

<script lang="ts">
    import { buttonVariants } from "$lib/components/ui/button";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Dialog from "$lib/components/ui/dialog";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import Import from "lucide-svelte/icons/import";
    import { cn } from "$lib/utils";

    let str = "";

    function HashString(path: string) {
        path = path.toLowerCase();

        let hash = 0;
        const magic = 16;
        const mask = 0xf0000000;

        for (let i = 0; i < path.length; i++) {
            hash = path.charCodeAt(i) + magic * hash;

            let hm = (hash & mask) >>> 0;
            if (hm > 0) hash ^= hm ^ (hm >>> 24);
        }

        return hash;
    }

    function HashStringNorm(str: string) {
        if (!str) return 0;

        str = str.toLowerCase();

        let hash = 0;
        const magic = 65599;

        for (let i = 0; i < str.length; i++)
            hash = (str.charCodeAt(i) + magic * hash) >>> 0;

        return hash;
    }
</script>

<Dialog.Root>
    <Dialog.Trigger
        class={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start")}
        >hash string</Dialog.Trigger
    >
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>hash string</Dialog.Title>
            <Dialog.Description>
                <form
                    action=""
                    on:submit|preventDefault={() => {
                        let item = $saved.find((v) => v.stringToHash === str);
                        if (item) return;

                        $saved.push({
                            stringToHash: str,
                            hashString: HashString(str),
                            hashStringNorm: HashStringNorm(str),
                        });
                        $saved = $saved;
                    }}
                >
                    <div class="mt-5 flex w-full flex-col gap-1.5">
                        <Label for="stringToHash">string</Label>
                        <div class="flex gap-1.5">
                            <Input id="stringToHash" bind:value={str} />
                            <Button variant="outline" type="submit" class="px-2"
                                ><Import size={20} /></Button
                            >
                        </div>
                    </div>

                    <div class="mt-5 flex w-full flex-col gap-1.5">
                        <Label for="hashString">hash string</Label>
                        <Input
                            id="hashString"
                            value={HashString(str)}
                            readonly
                        />
                    </div>

                    <div class="mt-3 flex w-full flex-col gap-1.5">
                        <Label for="hashStringNorm">hash string norm</Label>
                        <Input
                            id="hashStringNorm"
                            value={HashStringNorm(str)}
                            readonly
                        />
                    </div>
                </form>

                <div class="mt-10">
                    {#each $saved as item}
                        <div class="mt-1 border-t flex gap-5 justify-between">
                            <span
                                class="grow max-w-72 overflow-x-auto"
                                style="scrollbar-width: thin"
                                >{item.stringToHash}</span
                            >
                            <span>{item.hashString}</span>
                            <span>{item.hashStringNorm}</span>
                        </div>
                    {/each}
                </div>
            </Dialog.Description>
        </Dialog.Header>
    </Dialog.Content>
</Dialog.Root>

<script lang="ts">
    import { Toaster } from "$lib/components/ui/sonner";
    import SectionLeft from "./section-left/index.svelte";
    import SectionRight from "./section-right/index.svelte";
</script>

<div class="flex">
    <div class="p-3 border-r h-screen min-h-32">
        <SectionLeft />
    </div>
    <div class="grow">
        <SectionRight />
    </div>
</div>

<Toaster />

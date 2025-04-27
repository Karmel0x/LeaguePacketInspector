<script lang="ts" generics="T">
    export let items: T[];
    export let itemHeight = 30;

    let visibleRows: { index: number; offset: Number }[] = [];
    let scrollTop = 0;
    let containerHeight = 0;

    const maxHTMLElementHeight = 17895697;
    let totalRecords = 0;
    let expectedHeight = 0;
    let listElementHeight = 0;

    $: {
        totalRecords = items.length;
        expectedHeight = totalRecords * itemHeight;
        listElementHeight = Math.min(maxHTMLElementHeight, expectedHeight);

        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(
            startIndex + Math.floor(containerHeight / itemHeight),
            totalRecords - 1,
        );

        visibleRows = Array.from(
            { length: endIndex - startIndex + 1 },
            (_, i) => ({
                index: startIndex + i,
                offset: (startIndex + i) * itemHeight,
            }),
        );
    }

    function handleScroll(node: Element) {
        scrollTop = node.scrollTop;
    }

    function setContainerHeight(node: Element) {
        const resizeObserver = new ResizeObserver((entries) => {
            containerHeight = entries[0].contentRect.height;
        });
        resizeObserver.observe(node);
        return { destroy: () => resizeObserver.disconnect() };
    }
</script>

<div
    class="w-full h-full overflow-y-auto"
    style="scrollbar-width: thin"
    use:setContainerHeight
    on:scroll={(e) => handleScroll(e.currentTarget)}
>
    <div class="relative" style="height: {listElementHeight}px">
        {#each visibleRows as row}
            <div
                class="box-border absolute w-full"
                style="height: {itemHeight}px;top: {row.offset}px"
            >
                <slot name="item" item={items[row.index]} index={row.index} />
            </div>
        {/each}
        {#if expectedHeight > listElementHeight}
            <div
                class="box-border absolute w-full"
                style="height: 24px;bottom: {itemHeight * 2}px"
            >
                <div class="text-red-500">element height overflow</div>
            </div>
        {/if}
    </div>
</div>

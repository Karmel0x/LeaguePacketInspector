<script lang="ts">
    import * as Resizable from "$lib/components/ui/resizable";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import { onMount } from "svelte";
    import type { PacketLog } from "../../../contexts/packet-list";
    import JSONViewer from "./json-viewer/json-viewer";
    import "./json-viewer/json-viewer.css";
    import PacketDetailedListRowInfo from "./packet-detailed-list-row-info.svelte";

    export let item: PacketLog;
    export let packet: PacketLog;
    //console.log(item, packet);

    let viewContainer: HTMLDivElement;
    let hex = formatHex(packet.bytes!);
    const debugOffsets: Record<string, string> = packet.debugOffsets
        ? JSON.parse(packet.debugOffsets)
        : {};

    function formatHex(hex: string) {
        if (!hex) return "";
        let result = hex.replaceAll(" ", "").replaceAll("-", "");
        let m = result.match(/../g);
        if (!m) return hex;
        return m.join(" ");
    }

    function replaceAt(str: string, index: number, replacement: string) {
        return (
            str.substring(0, index) +
            replacement +
            str.substring(index + replacement.length)
        );
    }

    function parsedPacketSelection() {
        if (!viewContainer || !viewContainer.contains) return;

        const selection = window.getSelection();
        if (!selection) return;
        if (selection.rangeCount < 0) return;

        const range = selection.getRangeAt(0);
        if (!viewContainer.contains(range.commonAncestorContainer)) return;

        const selectedText = selection.toString();
        if (!selectedText) return;

        const offsets1 = debugOffsets[selectedText];
        if (!offsets1) return;

        let offsets = offsets1.split("-");
        let [startOffset, endOffset] = offsets.map((x) => parseInt(x));

        let result = hex;
        result = result.replace(">", " ");
        result = result.replace("<", " ");

        if (startOffset || endOffset) {
            let s = startOffset * 3 - 1;
            if (s > 0) result = replaceAt(result, s, ">");

            let e = endOffset * 3 - 1;
            if (e > 0) result = replaceAt(result, e, "<");

            result = result.trim();
        }

        hex = result;
    }

    onMount(() => {
        try {
            const pre = viewContainer.children[0];
            if (!pre || pre.className !== "unprocessed") return;

            const content = pre.textContent;
            if (!content) return;

            const jsonViewer = new JSONViewer();
            const container = jsonViewer.getContainer() as HTMLElement;

            const data = JSON.parse(content);
            const prettified = JSON.stringify(data, null, 2);

            let parsedLines = prettified.split("\n").length;
            container.style.height = `${Math.min(10, parsedLines) * 24}px`;

            jsonViewer.showJSON(data);
            viewContainer.replaceChildren(container);
        } catch (e) {
            console.log(e);
            viewContainer.style.borderColor = "red";
        }

        document.addEventListener("selectionchange", () => {
            parsedPacketSelection();
        });
    });
</script>

<Resizable.PaneGroup direction="horizontal">
    <Resizable.Pane class="border-t">
        <div class="max-w-xl flex mt-2">
            <PacketDetailedListRowInfo {item} />
        </div>
        <Textarea
            class="mt-2"
            style="scrollbar-width: thin"
            bind:value={hex}
            rows={Math.min(9, Math.floor(hex.length / 120))}
        ></Textarea>
    </Resizable.Pane>
    <Resizable.Handle />
    <Resizable.Pane>
        <div bind:this={viewContainer} class="border rounded">
            <pre class="unprocessed">{packet.parsed}</pre>
        </div>
    </Resizable.Pane>
</Resizable.PaneGroup>

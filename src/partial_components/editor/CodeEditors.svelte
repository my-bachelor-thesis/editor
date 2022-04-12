<script>
    import {GridStyleStore} from "./gridstyle"

    export let initValues, language1, language2

    let widthSolution1 = 0, widthTest1 = 0, widthSolution2 = 0, widthTest2 = 0

    const widthConstant = 0.99
</script>

<div class="grid" style="grid-template-columns: {$GridStyleStore}">
    {#await initValues}
        <div>Loading description...</div>
    {:then res}
        <div>
            <div class="editor-label">Description</div>
            {@html res.text}
        </div>
    {:catch error}
        <div style="color: red">{error.message}</div>
    {/await}

    {#if language1.showSolution}
        <div class="gutter-col gutter-col-1">
            <div class="vl"></div>
        </div>
        <div bind:clientWidth={widthSolution1}>
            <div id="solution1-label" class="editor-label">Solution 1</div>
            <div id="solution1" style="width: {widthSolution1*widthConstant}px"></div>
        </div>
    {/if}

    {#if language1.showTest}
        <div class="gutter-col gutter-col-3">
            <div class="vl"></div>
        </div>
        <div bind:clientWidth={widthTest1}>
            <div id="test1-label" class="editor-label">Test 1</div>
            <div id="test1" style="width: {widthTest1*widthConstant}px"></div>
        </div>
    {/if}

    {#if language2.showSolution}
        <div class="gutter-col gutter-col-5">
            <div class="vl"></div>
        </div>
        <div bind:clientWidth={widthSolution2}>
            <div id="solution2-label" class="editor-label">Solution 2</div>
            <div id="solution2" style="width: {widthSolution2*widthConstant}px"></div>
        </div>
    {/if}

    {#if language2.showTest}
        <div class="gutter-col gutter-col-7">
            <div class="vl"></div>
        </div>
        <div bind:clientWidth={widthTest2}>
            <div id="test2-label" class="editor-label">Test 2</div>
            <div id="test2" style="width: {widthTest2*widthConstant}px"></div>
        </div>
    {/if}
</div>

<style>
    .vl {
        border-left: 4px solid lightslategrey;
        height: var(--editor-height);
        margin-top: calc(var(--editor-height) * 0.05);
    }

    :global(.gutter.gutter-horizontal) {
        background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
        cursor: col-resize;
    }

    .grid {
        display: grid;
    }

    .gutter-col {
        grid-row: 1/-1;
        cursor: col-resize;
    }

    .gutter-col-1 {
        grid-column: 2;
    }

    .gutter-col-3 {
        grid-column: 4;
    }

    .gutter-col-5 {
        grid-column: 6;
    }

    .gutter-col-7 {
        grid-column: 8;
    }

    :global(.cm-scroller) {
        overflow: auto;
        max-height: var(--editor-height);
    }

    .editor-label {
        font-weight: bold;
        white-space: nowrap;
        text-align: center;
        margin-bottom: 1%;
        color: darkgrey;
    }
</style>
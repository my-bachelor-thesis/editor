<script>
    import ChangeNameButton from "./ChangeNameButton.svelte";
    import {Button} from "sveltestrap";
    import {GridStyleStore} from "./code_editors";

    export let solutionsAndTasksPromise, solutionSelector, testSelector, insertSelectedSolutionIntoEditor, insertSelectedTestIntoEditor, solutions, tests, languageNumber, showNotFailedSolutions, showFinalTests, gridStyle

    function minimizeMaximizeFunc(index) {
        let start = languageNumber === "1" ? 1 : 3
        GridStyleStore.minimizeMaximize(start + index)
    }
</script>

{#await solutionsAndTasksPromise}
    <p>Loading Solutions...</p>
{:then res}
    <label for="solution{languageNumber}-picker-select"><b>Select from solutions:</b></label>
    <select name="solution{languageNumber}-picker-select" id="solution{languageNumber}-picker-select" bind:value={solutionSelector}
            on:change={insertSelectedSolutionIntoEditor}>
        {#each Object.entries(solutions) as [id, info]}
            {#if info.exit_code === 0 || !showNotFailedSolutions }
                <option value={id} class="{info.exit_code !== 0 ? 'error-msg' : ''}">{info.date}
                    <span>{info.exit_code !== 0 ? '(failed)' : ''}</span></option>
            {/if}
        {/each}
    </select>
    &nbsp;
    <ChangeNameButton id="changeSolution{languageNumber}Name"/>
    &nbsp;
    <Button color="secondary" class="btn-sm" on:click={() => minimizeMaximizeFunc(0)}>Minimize/maximize</Button>

    <br>
    <label for="test{languageNumber}-picker-select"><b>Select from test:</b></label>
    <select name="test{languageNumber}-picker-select" id="test{languageNumber}-picker-select" bind:value={testSelector}
            on:change={insertSelectedTestIntoEditor}>
        {#each Object.entries(tests) as [id, info]}
            {#if !showFinalTests || info.final}
                <option value={id} class="{info.final ? 'error-msg' : ''}">{info.date}
                    <span>{info.final ? '(final)' : ''}</span></option>
            {/if}
        {/each}
    </select>
    &nbsp;
    <ChangeNameButton id="changeTest{languageNumber}Name"/>
    &nbsp;
    <Button color="secondary" class="btn-sm" on:click={() => minimizeMaximizeFunc(1)}>Minimize/maximize</Button>
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}

<hr>
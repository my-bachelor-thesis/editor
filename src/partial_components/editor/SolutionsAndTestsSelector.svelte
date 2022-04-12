<script>
    import ChangeNameButton from "./ChangeNameButton.svelte";
    import {Button} from "sveltestrap";
    import {GridStyleStore} from "./gridstyle";

    export let language, filters, url, testResultsCache, paringFunction,
        insertSelectedSolutionIntoEditor, insertSelectedTestIntoEditor

    function minimizeMaximizeFunc(index) {
        let elementType = index % 2 === 0 ? "solution" : "test"
        let label = document.getElementById(`${elementType}${language.number}-label`)
        let editor = document.getElementById(`${elementType}${language.number}`)

        let start = language.number === 1 ? 1 : 3
        GridStyleStore.minimizeMaximize(start + index)

        if (label.style.display === "none") {
            label.style.display = "block"
            editor.style.display = "block"
        } else {
            label.style.display = "none"
            editor.style.display = "none"
        }
    }
</script>

{#await language.solutionsAndTestsSelector.promise}
    <p>Loading Solutions...</p>
{:then res}
    <label for="solution{language.number}-picker-select"><b>Select from solutions:</b></label>
    <select name="solution{language.number}-picker-select" id="solution{language.number}-picker-select"
            bind:value={language.solutionsAndTestsSelector.selectedSolution}
            on:change={() => insertSelectedSolutionIntoEditor(language)}>
        {#each Object.entries(language.cache.solutions) as [id, info]}
            {#if info.exit_code === 0 || !filters.showNotFailedSolutions }
                <option value={id} class="{info.exit_code !== 0 ? 'error-msg' : ''}">{info.date}
                    <span>{info.exit_code !== 0 ? '(failed)' : ''}</span></option>
            {/if}
        {/each}
    </select>
    &nbsp;
    <ChangeNameButton id="changeSolution{language.number}Name"/>
    &nbsp;
    <Button color="secondary" class="btn-sm" on:click={() => minimizeMaximizeFunc(0)}>Minimize/maximize
    </Button>

    <br>
    <label for="test{language.number}-picker-select"><b>Select from test:</b></label>
    <select name="test{language.number}-picker-select" id="test{language.number}-picker-select"
            bind:value={language.solutionsAndTestsSelector.selectedTest}
            on:change={() => insertSelectedTestIntoEditor(language)}>
        {#each Object.entries(language.cache.tests) as [id, info]}
            {#if !filters.showFinalTests || info.final}
                <option value={id} class="{info.final ? 'error-msg' : ''}">{info.date}
                    <span>{info.final ? '(final)' : ''}</span></option>
            {/if}
        {/each}
    </select>
    &nbsp;
    <ChangeNameButton id="changeTest{language.number}Name"/>
    &nbsp;
    <Button color="secondary" class="btn-sm" on:click={() => minimizeMaximizeFunc(1)}>Minimize/maximize</Button>
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}

<hr>
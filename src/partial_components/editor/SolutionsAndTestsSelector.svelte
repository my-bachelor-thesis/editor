<script>
    import ChangeNameButton from "./ChangeNameButton.svelte";
    import {Button} from "sveltestrap";
    import {GridStyleStore} from "./gridstyle";
    import * as helpers from "../../helpers";

    export let language, filters, url, testResultsCache, paringFunction

    function minimizeMaximizeFunc(index) {
        console.log(index)
        let start = language.number === 1 ? 1 : 3
        GridStyleStore.minimizeMaximize(start + index)
        // let elementType = index % 2 === 0 ? "solution" : "test"
        // let minimizedElement = document.getElementById(`${elementType}${language.number}-label`)
        // console.log(minimizedElement)
        // minimizedElement.style.display === "none" ? minimizedElement.style.display = "block" : minimizedElement.style.display = "none"
    }

    async function fetchCodeOfTest(id) {
        return helpers.fetchJson(`${url}/code-of-test/${id}`)
    }

    async function fetchCodeOfSolution(id) {
        return helpers.fetchJson(`${url}/code-of-solution/${id}`)
    }

    function loadResultFromCache() {
        if (testResultsCache.has(paringFunction(language.solutionsAndTestsSelector.selectedSolution, language.solutionsAndTestsSelector.selectedTest))) {
            language.testResult.show = true
            language.testResult.promise = new Promise((resolve, _) => {
                resolve(testResultsCache.get(paringFunction(language.solutionsAndTestsSelector.selectedSolution, language.solutionsAndTestsSelector.selectedTest)))
            })
            language.testResult.promise.then((res) => {
                console.log(res)
            })
        }
    }

    function insertSelectedSolutionIntoEditor() {
        language.infoBoxContent = []
        language.testResult.show = false
        loadResultFromCache()
        fetchCodeOfSolution(language.solutionsAndTestsSelector.selectedSolution).then((data) => {
            let code = data.code
            language.editors.solution.dispatch({
                changes: {from: 0, to: language.editors.solution.state.doc.length, insert: code}
            })
            language.cache.solutionFromLastRun = code
        })
    }

    function insertSelectedTestIntoEditor() {
        language.infoBoxContent = []
        language.testResult.show = false
        loadResultFromCache()
        fetchCodeOfTest(language.solutionsAndTestsSelector.selectedTest).then((data) => {
            let code = data.code
            language.editors.test.dispatch({
                changes: {from: 0, to: language.editors.test.state.doc.length, insert: code}
            })
            language.cache.testFromLastRun = code
        })
    }
</script>

{#await language.solutionsAndTestsSelector.promise}
    <p>Loading Solutions...</p>
{:then res}
    <label for="solution{language.number}-picker-select"><b>Select from solutions:</b></label>
    <select name="solution{language.number}-picker-select" id="solution{language.number}-picker-select"
            bind:value={language.solutionsAndTestsSelector.selectedSolution}
            on:change={insertSelectedSolutionIntoEditor}>
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
    <Button color="secondary" class="btn-sm" on:click={() => minimizeMaximizeFunc(0)}>Minimize/maximize</Button>

    <br>
    <label for="test{language.number}-picker-select"><b>Select from test:</b></label>
    <select name="test{language.number}-picker-select" id="test{language.number}-picker-select"
            bind:value={language.solutionsAndTestsSelector.selectedTest}
            on:change={insertSelectedTestIntoEditor}>
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
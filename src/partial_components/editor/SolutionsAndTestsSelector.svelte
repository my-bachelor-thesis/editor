<script>
    import ChangeNameButton from "./ChangeNameButton.svelte";
    import {Button} from "sveltestrap";
    import {GridStyleStore} from "./gridstyle";
    import Select from "svelte-select";

    export let language, url, testResultsCache, paringFunction, selectedSolutionStore, selectedTestStore

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

<div class="small-margin">

    {#await language.solutionsAndTestsSelector.promise}
        <p>Loading Solutions...</p>
    {:then _}
        <div class="solutions-and-tests-selector">
            <label for="solution{language.number}-picker-select"><b>Select from solutions:</b></label>
            <Select id="solution{language.number}-picker-select"
                    items={language.solutionsAndTestsSelector.solutionsForSelect}
                    bind:value={$selectedSolutionStore} isClearable={false}/>
        </div>
        <ChangeNameButton id="changeSolution{language.number}Name"/>
        &nbsp;
        <Button color="secondary" class="btn-sm" on:click={() => minimizeMaximizeFunc(0)}>Minimize/maximize
        </Button>

        <br>

        <div class="solutions-and-tests-selector">
            <label for="test{language.number}-picker-select"><b>Select from tests:</b></label>
            <Select id="test{language.number}-picker-select" items={language.solutionsAndTestsSelector.testsForSelect}
                    bind:value={$selectedTestStore} isClearable={false}/>
        </div>
        <ChangeNameButton id="changeTest{language.number}Name"/>
        &nbsp;
        <Button color="secondary" class="btn-sm" on:click={() => minimizeMaximizeFunc(1)}>Minimize/maximize</Button>
    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}

</div>

<hr>

<style>
    .solutions-and-tests-selector {
        max-width: 30%;
        margin-top: 0.5%;
        margin-bottom: 1%;
    }
</style>
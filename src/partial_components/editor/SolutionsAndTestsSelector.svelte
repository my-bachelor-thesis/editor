<script>
    import ChangeNameButton from "./ChangeNameButton.svelte";
    import {Button, Col} from "sveltestrap";
    import {GridStyleStore} from "./gridstyle";
    import Select from "svelte-select";
    import HelpMessage from "../messages/HelpMessage.svelte";

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


{#await language.solutionsAndTestsSelector.promise}
    <p>Loading Solutions...</p>
{:then _}

    <Col class="solutions-and-tests-selector">
        <label for="solution{language.number}-picker-select" class="no-wrap"><b>Select from solutions:</b></label>
        <HelpMessage text="select a solution from available solutions"/>
        <Select id="solution{language.number}-picker-select"
                items={language.solutionsAndTestsSelector.solutionsForSelect}
                bind:value={$selectedSolutionStore} isClearable={false}/>
    </Col>

    <Col xs="auto">
        <ChangeNameButton id="changeSolution{language.number}Name"/>

        <div style="margin-top: 1%">
            <Button class="no-wrap" color="secondary" size="sm" on:click={() => minimizeMaximizeFunc(0)}>
                Minimize/maximize
            </Button>
        </div>
    </Col>


    <Col class="solutions-and-tests-selector">
        <label for="test{language.number}-picker-select" class="no-wrap"><b>Select from tests:</b></label>
        <HelpMessage text="select a test from available tests"/>
        <Select id="test{language.number}-picker-select" items={language.solutionsAndTestsSelector.testsForSelect}
                bind:value={$selectedTestStore} isClearable={false}/>
    </Col>


    <Col xs="auto">
        <ChangeNameButton id="changeTest{language.number}Name"/>

        <div style="margin-top: 1%">
            <Button class="no-wrap" color="secondary" size="sm" on:click={() => minimizeMaximizeFunc(1)}>
                Minimize/maximize
            </Button>
        </div>
    </Col>
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}
<script>
    import ChangeNameButton from "./ChangeNameButton.svelte";
    import {Button, Col} from "sveltestrap";
    import {GridStyleStore} from "./gridstyle";
    import Select from "svelte-select";
    import HelpMessage from "../messages/HelpMessage.svelte";

    export let language, selectedSolutionStore, selectedTestStore, filters, onSelectSolution,
        onSelectTest

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

    // filters

    function solutionsThatDidntFail() {
        return language.solutionsAndTestsSelector.solutions.filter(solution => solution.exit_code === 0)
    }

    function finalTests() {
        return language.solutionsAndTestsSelector.tests.filter(test => test.final === true)
    }
</script>


{#await language.solutionsAndTestsSelector.promise}
    <p>Loading Solutions...</p>
{:then _}

    <Col class="solutions-and-tests-selector">
        <label for="solution{language.number}-picker-select" class="no-wrap"><b>Select from solutions:</b></label>
        <HelpMessage text="select a solution from available solutions"/>
        <Select id="solution{language.number}-picker-select"
                items={filters.showNotFailedSolutions ? solutionsThatDidntFail(language.solutionsAndTestsSelector.solutions) : language.solutionsAndTestsSelector.solutions}
                bind:value={$selectedSolutionStore} isClearable={false}
                on:select={(e) => onSelectSolution(e.detail, language, selectedTestStore)}
        />
    </Col>

    <Col xs="auto">
        <ChangeNameButton type="solution" bind:language={language} selectedStore={selectedSolutionStore}/>

        <div style="margin-top: 1%">
            <Button class="no-wrap" color="secondary" size="sm" on:click={() => minimizeMaximizeFunc(0)}>
                Minimize/maximize
            </Button>
        </div>
    </Col>


    <Col class="solutions-and-tests-selector">
        <label for="test{language.number}-picker-select" class="no-wrap"><b>Select from tests:</b></label>
        <HelpMessage text="select a test from available tests"/>
        <Select id="test{language.number}-picker-select"
                items={filters.showFinalTests ? finalTests(language.solutionsAndTestsSelector.tests) : language.solutionsAndTestsSelector.tests}
                bind:value={$selectedTestStore} isClearable={false}
                on:select={(e) => onSelectTest(e.detail, language, selectedSolutionStore)}
        />
    </Col>


    <Col xs="auto">
        <ChangeNameButton type="test" bind:language={language} selectedStore={selectedTestStore}/>

        <div style="margin-top: 1%">
            <Button class="no-wrap" color="secondary" size="sm" on:click={() => minimizeMaximizeFunc(1)}>
                Minimize/maximize
            </Button>
        </div>
    </Col>
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}
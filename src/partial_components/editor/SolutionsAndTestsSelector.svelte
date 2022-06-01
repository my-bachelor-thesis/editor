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

    let tests, solutions

    $: if (filters) {
        tests = language.solutionsAndTestsSelector.tests
        solutions = language.solutionsAndTestsSelector.solutions
        if (filters.showFinalTests) {
            tests = tests.filter(test => test.final)
        }
        if (filters.showPublicTests) {
            tests = tests.filter(test => test.public)
        }
        if (filters.showPublicSolutions) {
            solutions = solutions.filter(solution => solution.public)
        }
    }
</script>


{#await language.solutionsAndTestsSelector.promise}
    <p>Loading Solutions...</p>
{:then _}

    <Col class="solutions-and-tests-selector">
        <label for="solution{language.number}-picker-select" class="no-wrap"><b>Select from solutions:</b></label>
        <HelpMessage imageWidthPercentage="120"
                     text="Solution with 🌐 emoji are public (they were added by the task creator)"/>
        <Select id="solution{language.number}-picker-select"
                items={solutions}
                bind:value={$selectedSolutionStore} isClearable={false}
                on:select={(e) => onSelectSolution(e.detail, language, selectedTestStore, selectedSolutionStore)}
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
        <HelpMessage imageWidthPercentage="120" text="Tests with 🌐 emoji are public (they were added by the task creator).
            Tests with ✔ emoji are final (they were added by the task creator
            and you have to solve them in order to participate in the task statistics)"/>
        <Select id="test{language.number}-picker-select"
                items={tests}
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
<script>
    import {go} from "@codemirror/legacy-modes/mode/go"
    import {StreamLanguage} from "@codemirror/stream-parser"
    import {python} from "@codemirror/lang-python"
    import * as store from "./store"
    import {get} from "svelte/store"
    import RunLanguagePanel from "./partial_components/editor/RunLanguagePanel.svelte"
    import CodeEditors from "./partial_components/editor/CodeEditors.svelte"
    import SolutionsAndTestsSelector from "./partial_components/editor/SolutionsAndTestsSelector.svelte"
    import * as helpers from "./helpers"
    import LanguageSelector from "./partial_components/editor/LanguageSelector.svelte"
    import {GridStyleStore} from "./partial_components/editor/gridstyle";
    import {SelectedSolutionStore, SelectedTestStore} from "./partial_components/editor/selected";
    import {Row} from "sveltestrap";

    // variables //

    let url = get(store.url)

    let isSecondLanguageIsSelected = false

    const taskId = new URLSearchParams(window.location.search).get("id")
    let initValues = getInitValues()

    let filters = {
        showNotFailedSolutions: false,
        showFinalTests: false,
    }

    function SolutionsAndTests() {
        this.show = false
        this.promise = Promise.resolve([])
        this.tests = []
        this.solutions = []
    }

    function Cache() {
        this.testFromLastRun = null
        this.solutionFromLastRun = null
    }

    function Editors() {
        this.solution = null
        this.test = null
    }

    function TestResult() {
        this.show = false
        this.promise = Promise.resolve([])
    }

    function Language(number) {
        this.name = ""
        this.number = number
        this.cache = new Cache()
        this.infoBoxContent = []
        this.editors = new Editors()
        this.testResult = new TestResult()
        this.cache = new Cache()
        this.solutionsAndTestsSelector = new SolutionsAndTests()
        this.showSolution = false
        this.showTest = false
    }

    let language1 = new Language(1)
    let language2 = new Language(2)

    let editorHeight = Math.floor(window.innerHeight / 1.5) + "px"

    // helper functions //

    function paringFunction(solutionHash, testHash) {
        return solutionHash + "," + testHash
    }

    function languageToCodemirrorFunction(language) {
        switch (language) {
            case 'go':
                return StreamLanguage.define(go)
            case 'python':
                return python()
        }

    }

    // insert code into editors

    async function fetchCodeOfTest(id) {
        return helpers.fetchJson(`${url}/code-of-test/${id}`)
    }

    async function fetchCodeOfSolution(id) {
        return helpers.fetchJson(`${url}/code-of-solution/${id}`)
    }

    function insertSelectedSolutionIntoEditor(language, selected) {
        if (selected === undefined) {
            return
        }
        language.infoBoxContent = []
        language.testResult.show = false
        fetchCodeOfSolution(selected.value).then((data) => {
            language.editors.solution.dispatch({
                changes: {from: 0, to: language.editors.solution.state.doc.length, insert: data.code}
            })
        })
    }

    function insertSelectedTestIntoEditor(language, selected) {
        if (selected === undefined) {
            return
        }
        language.infoBoxContent = []
        language.testResult.show = false
        fetchCodeOfTest(selected.value).then((data) => {
            language.editors.test.dispatch({
                changes: {from: 0, to: language.editors.test.state.doc.length, insert: data.code}
            })
        })
    }

    // init values //

    async function getInitValues() {
        return helpers.fetchJson(`${url}/init-data/${taskId}`)
    }


    // reset gridstyle

    GridStyleStore.reset()

    // stores

    let selectedSolutionLanguage1Store = new SelectedSolutionStore()
    let selectedTestLanguage1Store = new SelectedTestStore()
    let selectedSolutionLanguage2Store = new SelectedSolutionStore()
    let selectedTestLanguage2Store = new SelectedTestStore()

    selectedSolutionLanguage1Store.subscribe(val => insertSelectedSolutionIntoEditor(language1, val))
    selectedTestLanguage1Store.subscribe(val => insertSelectedTestIntoEditor(language1, val))
    selectedSolutionLanguage2Store.subscribe(val => insertSelectedSolutionIntoEditor(language2, val))
    selectedTestLanguage2Store.subscribe(val => insertSelectedTestIntoEditor(language2, val))
</script>

<!---------------------------------------- html starts here ---------------------------------------->

<!-- initial info -->

<div class="small-margin">
    {#await initValues}
        <p>Loading title...</p>
    {:then task}
        <h1>{task.title}</h1><br>
        <p><b>Difficulty: </b><span class="{task.difficulty}">{task.difficulty}</span></p>
        <p><b>Added on:</b> {task.added_on}</p>
        <p><b>Author:</b> {task.author}</p>
        <p><b>Approver:</b> {task.approver}</p>
    {:catch error}
        <p class="error-msg">{error.message}</p>
    {/await}
</div>

{#if language1.solutionsAndTestsSelector.show}

    <hr>

    <fieldset class="small-margin">
        <legend>Choose filters</legend>
        <div>
            <label>
                <input type="checkbox" bind:checked={filters.showNotFailedSolutions}>
                show only solutions that didn't fail
            </label>
        </div>
        <div>
            <label>
                <input type="checkbox" bind:checked={filters.showFinalTests}>
                show only final tests
            </label>
        </div>
    </fieldset>

{/if}

<!-- selectors -->

<div class="selector">
    {#await initValues}
        <p>Loading languages...</p>
    {:then res}

        <!-- language 1 -->
        <hr>

        <Row>

            <LanguageSelector
                    bind:language={language1}
                    initValues={res}
                    taskId={taskId}
                    url={url}
                    selectedSolutionStore={selectedSolutionLanguage1Store}
                    selectedTestStore={selectedTestLanguage1Store}
                    bind:isSecondLanguageIsSelected={isSecondLanguageIsSelected}
            />

            {#if language1.solutionsAndTestsSelector.show}

                <SolutionsAndTestsSelector
                        bind:language={language1}
                        selectedSolutionStore={selectedSolutionLanguage1Store}
                        selectedTestStore={selectedTestLanguage1Store}
                        filters={filters}
                />

            {/if}

        </Row>

        <!--         language 2 -->
        {#if language1.solutionsAndTestsSelector.show}
            <Row>

                <LanguageSelector
                        bind:language={language2}
                        initValues={res}
                        taskId={taskId}
                        url={url}
                        selectedSolutionStore={selectedSolutionLanguage2Store}
                        selectedTestStore={selectedTestLanguage2Store}
                        bind:isSecondLanguageIsSelected={isSecondLanguageIsSelected}
                />

                {#if language2.solutionsAndTestsSelector.show}
                    <SolutionsAndTestsSelector
                            bind:language={language2}
                            selectedSolutionStore={selectedSolutionLanguage2Store}
                            selectedTestStore={selectedTestLanguage2Store}
                            filters={filters}
                    />
                {/if}

            </Row>
        {/if}

        <br>

    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}
</div>

<br>

<!-- editors -->

<CodeEditors
        initValues={initValues}
        language1={language1}
        language2={language2}
        --editor-height={editorHeight}
/>

<!-- test results 1 -->

<br>

<RunLanguagePanel
        language={language1}
        url={url}
        taskId={taskId}
        paringFunction={paringFunction}
        selectedSolutionStore={selectedSolutionLanguage1Store}
        selectedTestStore={selectedTestLanguage1Store}
/>

<!-- test results 2 -->

<RunLanguagePanel
        language={language2}
        url={url}
        taskId={taskId}
        paringFunction={paringFunction}
        selectedSolutionStore={selectedSolutionLanguage2Store}
        selectedTestStore={selectedTestLanguage2Store}
/>
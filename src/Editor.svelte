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

    // variables //

    let url = get(store.url)

    const taskId = new URLSearchParams(window.location.search).get('id')
    let initValues = getInitValues()

    let filters = {
        showNotFailedSolutions: false,
        showFinalTests: false,
    }

    let testResultsCache = new Map()

    function SolutionsAndTests() {
        this.show = false
        this.promise = Promise.resolve([])
        this.selectedSolution = 0
        this.selectedTest = 0
    }

    function Cache() {
        this.tests = new Map()
        this.solutions = new Map()
        this.testFromLastRun = ""
        this.solutionFromLastRun = ""
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

    // reset gridstyle

    GridStyleStore.reset()

    // helper functions //

    function paringFunction(a, b) {
        return a + "," + b
    }

    function languageToCodemirrorFunction(language) {
        switch (language) {
            case 'go':
                return StreamLanguage.define(go)
            case 'python':
                return python()
        }

    }

    // init values //

    async function getInitValues() {
        return helpers.fetchJson(`${url}/init-data/${taskId}`)
    }
</script>

<!---------------------------------------- html starts here ---------------------------------------->

<!-- initial info -->

<div class="title">
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

<br>
<hr>

<fieldset>
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

<!-- selectors -->

<div class="selector">
    {#await initValues}
        <p>Loading languages...</p>
    {:then res}

        <!-- language 1 -->
        <hr>

        <LanguageSelector
                bind:language={language1}
                initValues={res}
                taskId={taskId}
                url={url}
        />

        <br>

        {#if language1.solutionsAndTestsSelector.show}

            <SolutionsAndTestsSelector
                    bind:language={language1}
                    filters={filters}
                    url={url}
                    testResultsCache={testResultsCache}
                    paringFunction={paringFunction}
            />

            <!-- language 2 -->

            <LanguageSelector
                    bind:language={language2}
                    initValues={res}
                    taskId={taskId}
                    url={url}
            />

            <br>

            {#if language2.solutionsAndTestsSelector.show}
                <SolutionsAndTestsSelector
                        bind:language={language2}
                        filters={filters}
                        url={url}
                        testResultsCache={testResultsCache}
                        paringFunction={paringFunction}
                />
            {/if}
        {/if}

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
        testResultsCache={testResultsCache}
        paringFunction={paringFunction}
/>

<!-- test results 2 -->

<RunLanguagePanel
        language={language2}
        url={url}
        taskId={taskId}
        testResultsCache={testResultsCache}
        paringFunction={paringFunction}
/>


<!---------------------------------------- styles ---------------------------------------->

<style>
    .selector label {
        display: inline;
        padding-right: 4px;
    }

    .selector select {
        margin-top: 4px;
    }
</style>

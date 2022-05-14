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
    import {Row, Tooltip} from "sveltestrap";
    import md5 from "blueimp-md5";

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

    // reset gridstyle

    GridStyleStore.reset()

    // stores

    let selectedSolutionLanguage1Store = new SelectedSolutionStore()
    let selectedTestLanguage1Store = new SelectedTestStore()
    let selectedSolutionLanguage2Store = new SelectedSolutionStore()
    let selectedTestLanguage2Store = new SelectedTestStore()

    // update last opened

    function updateLastOpened() {
        if (!get(selectedSolutionLanguage1Store)) {
            return
        }

        let id1 = language1.name ? parseInt(get(selectedSolutionLanguage1Store).value) : 0
        let id2 = 0
        if (get(selectedSolutionLanguage2Store) && language2.name) {
            id2 = parseInt(get(selectedSolutionLanguage2Store).value)
        }

        helpers.postJson(`${get(store.url)}/editor/change-last-opened`, JSON.stringify({
            task_id: parseInt(taskId),
            user_solution_id_for_language_1: id1,
            language_1: language1.name,
            user_solution_id_for_language_2: id2,
            language_2: language2.name,
        }))
    }

    // title variable is used for title tooltip

    let title

    // handling when solution changes

    let showTestResultLanguage1 = false, showTestResultLanguage2 = false

    async function fetchCodeOfSolution(id) {
        return helpers.fetchJson(`${url}/code-of-solution/${id}`)
    }

    function insertSelectedSolutionIntoEditor(language, selected) {
        if (!selected) {
            return
        }
        fetchCodeOfSolution(selected.value).then((data) => {
            language.editors.solution.dispatch({
                changes: {from: 0, to: language.editors.solution.state.doc.length, insert: data.code}
            })
            language.cache.solutionFromLastRun = md5(data.code)
        })
    }

    function onSelectSolution(event, language, selectedTestStore, selectedSolutionStore, doUpdateLastOpened = true) {
        if (doUpdateLastOpened) {
            updateLastOpened()
        }

        console.log("event", event, get(selectedTestStore).value === event.test_id)

        insertSelectedSolutionIntoEditor(language, event)

        if (!event.test_id) {
            let index = language.solutionsAndTestsSelector.solutions.findIndex(x => x.value === event.value)
            language.solutionsAndTestsSelector.solutions[index].test_id = get(selectedTestStore).value
            updateTestId(event.value, get(selectedTestStore).value)
        } else if (get(selectedTestStore).value !== event.test_id) {
            let test = language.solutionsAndTestsSelector.tests.find(x => x.value === event.test_id)
            if (test) {
                selectedTestStore.set(test)
                onSelectTest(test, language, selectedSolutionStore)
            }
        }

        if (language.dontHideTestResultWhileInsertingSolution) {
            // don't show again
            language.dontHideTestResultWhileInsertingSolution = false
        } else {
            language.number === 1 ? showTestResultLanguage1 = false : showTestResultLanguage2 = false

            helpers.fetchJson(`${url}/editor/get-solution-result/${event.value}/${get(selectedTestStore).value}`).then(data => {
                console.log("90", data, event.value, get(selectedTestStore).value)
                if (data !== "not found") {
                    language.testResult.promise = new Promise((resolve, _) => {
                        resolve({result: data})
                    })
                    language.number === 1 ? showTestResultLanguage1 = true : showTestResultLanguage2 = true
                }
            })
        }
    }


    // handling when test changes

    async function updateTestId(userSolutionId, testId) {
        let body = JSON.stringify({
            user_solution_id: parseInt(userSolutionId),
            test_id: parseInt(testId)
        })
        return helpers.postJson(`${url}/editor/change-testid-for-usersolution`, body)
    }


    async function fetchCodeOfTest(id) {
        return helpers.fetchJson(`${url}/code-of-test/${id}`)
    }

    function insertSelectedTestIntoEditor(language, selected) {
        console.log(":", selected)
        if (!selected) {
            return
        }
        fetchCodeOfTest(selected.value).then((data) => {
            language.editors.test.dispatch({
                changes: {from: 0, to: language.editors.test.state.doc.length, insert: data.code}
            })
            language.cache.testFromLastRun = md5(data.code)
        })
    }

    function onSelectTest(event, language, selectedSolutionStore) {
        console.log("f")

        insertSelectedTestIntoEditor(language, event)

        if (!get(selectedSolutionStore) || get(selectedSolutionStore).test_id === event.value) {
            return
        }

        let index = language.solutionsAndTestsSelector.solutions.findIndex(x => x.value === get(selectedSolutionStore).value)
        language.solutionsAndTestsSelector.solutions[index].test_id = event.value

        if (!language.dontHideTestResultWhileInsertingTest) {
            updateTestId(get(selectedSolutionStore).value, event.value)
        }

        if (language.dontHideTestResultWhileInsertingTest) {
            // don't show again
            language.dontHideTestResultWhileInsertingTest = false
        } else {
            language.number === 1 ? showTestResultLanguage1 = false : showTestResultLanguage2 = false
        }

        helpers.fetchJson(`${url}/editor/get-solution-result/${get(selectedSolutionStore).value}/${event.value}`).then(data => {
            if (data !== "not found") {
                language.testResult.promise = new Promise((resolve, _) => {
                    resolve({result: data})
                })
                language.number === 1 ? showTestResultLanguage1 = true : showTestResultLanguage2 = true
            }
        })
    }

    // getting data about last opened solutions

    let lastOpened = helpers.fetchJson(`${url}/editor/get-last-opened/${taskId}`)
</script>

<!---------------------------------------- html starts here ---------------------------------------->

<!-- initial info -->

<div class="small-margin">
    {#await initValues}
        <p>Loading title...</p>
    {:then task}
        <div style="display: inline-block;" bind:this={title}>
            <h1 style="white-space: nowrap;">{task.title}<span id="title-difficulty"
                                                               class="{task.difficulty}">({task.difficulty})</span></h1>
        </div>
        <br>
        <Tooltip target={title} placement="right">
            <strong>Added on:</strong> {task.added_on}
            <strong>Author:</strong> {task.author}
            {#if get(store.isAdmin)}
                <strong>Approver:</strong> {task.approver}
            {/if}
        </Tooltip>

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
                    onSelectSolution={onSelectSolution}
                    onSelectTest={onSelectTest}
                    updateLastOpened={updateLastOpened}
                    lastOpened={lastOpened}
            />

            {#if language1.solutionsAndTestsSelector.show}

                <SolutionsAndTestsSelector
                        bind:language={language1}
                        selectedSolutionStore={selectedSolutionLanguage1Store}
                        selectedTestStore={selectedTestLanguage1Store}
                        filters={filters}
                        onSelectSolution={onSelectSolution}
                        onSelectTest={onSelectTest}
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
                        onSelectSolution={onSelectSolution}
                        onSelectTest={onSelectTest}
                        updateLastOpened={updateLastOpened}
                        lastOpened={lastOpened}
                />

                {#if language2.solutionsAndTestsSelector.show}
                    <SolutionsAndTestsSelector
                            bind:language={language2}
                            selectedSolutionStore={selectedSolutionLanguage2Store}
                            selectedTestStore={selectedTestLanguage2Store}
                            filters={filters}
                            onSelectSolution={onSelectSolution}
                            onSelectTest={onSelectTest}
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
        bind:language={language1}
        url={url}
        taskId={taskId}
        selectedSolutionStore={selectedSolutionLanguage1Store}
        selectedTestStore={selectedTestLanguage1Store}
        bind:showTestResult={showTestResultLanguage1}
        updateTestId={updateTestId}
/>

<!-- test results 2 -->

<RunLanguagePanel
        bind:language={language2}
        url={url}
        taskId={taskId}
        selectedSolutionStore={selectedSolutionLanguage2Store}
        selectedTestStore={selectedTestLanguage2Store}
        bind:showTestResult={showTestResultLanguage2}
        updateTestId={updateTestId}
/>

<style>
    #title-difficulty {
        font-size: 70%;
        margin-left: 3%;
    }
</style>
<script>
    import Split from 'split-grid'
    import {basicSetup, EditorState} from "@codemirror/basic-setup"
    import {EditorView, keymap} from "@codemirror/view"
    import {indentWithTab} from "@codemirror/commands"
    import {go} from "@codemirror/legacy-modes/mode/go"
    import {StreamLanguage} from "@codemirror/stream-parser"
    import {python} from "@codemirror/lang-python"
    import * as store from "./store"
    import {get} from "svelte/store";
    import RunLanguagePanel from "./partial_components/editor/RunLanguagePanel.svelte";
    import CodeEditors from "./partial_components/editor/CodeEditors.svelte";
    import LanguageSelector from "./partial_components/editor/LanguageSelector.svelte";
    import SolutionsAndTestsSelector from "./partial_components/editor/SolutionsAndTestsSelector.svelte";
    import {GridStyleStore} from "./partial_components/editor/code_editors";

    // variables //

    let url = get(store.url)

    let openTest1Name = false, openSolution2Name = false, openTest2Name = false
    const toggleTest1Name = () => (openTest1Name = !openTest1Name)
    const toggleSolution2Name = () => (openSolution2Name = !openSolution2Name)
    const toggleTest2Name = () => (openTest2Name = !openTest2Name)
    let test1Name = "", solution2Name = "", test2Name = ""

    const taskId = new URLSearchParams(window.location.search).get('id')
    const initValues = getInitValues()

    let languageName1 = "", languageName2 = ""

    let showNotFailedSolutions = false, showFinalTests = false

    let solution1Editor, test1Editor, solution2Editor, test2Editor

    let test1FromLastRun = "", test1Unchanged = "", test2FromLastRun = "", test2Unchanged = ""
    let solution1FromLastRun = "", solution1Unchanged = "", solution2FromLastRun = "", solution2Unchanged = ""

    let showTest1 = false, showTest2 = false, showSolution1 = false, showSolution2 = false

    let showSolutionsAndTestsSelector1 = false, showSolutionsAndTestsSelector2 = false
    let solutionSelector1 = 0, solutionSelector2 = 0, testSelector1 = 0, testSelector2 = 0
    let solutionsAndTasksPromise1 = Promise.resolve([]), solutionsAndTasksPromise2 = Promise.resolve([])

    let showTest1Result = false, showTest2Result = false
    let promiseTest1Result = Promise.resolve([]), promiseTest2Result = Promise.resolve([])

    let tests1 = new Map(), tests2 = new Map(), solutions1 = new Map(), solutions2 = new Map()

    let infoBoxContent1 = []
    let infoBoxContent2 = []

    let testResultsCache = new Map()

    let editorHeight = Math.floor(window.innerHeight / 1.5) + "px"

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

    async function fetchJson(url) {
        const res = await fetch(url)
        const data = await res.json()
        if (res.ok) {
            return data
        } else {
            throw new Error(data)
        }
    }

    async function waitForElement(id, timeout = 10) {
        timeout *= 1000 // from s to ms
        let start = performance.now();
        while (document.getElementById(id) === null) {
            await new Promise(r => setTimeout(r, 50));
            if (performance.now() - start > timeout) {
                return
            }
        }
    }

    // init values //

    async function getInitValues() {
        return fetchJson(`${url}/init-data/${taskId}`)
    }

    // change language//

    function changeLanguage1() {
        infoBoxContent1 = []
        if (GridStyleStore.isEmpty()) {
            GridStyleStore.addBoxes(1)
        }
        if (!showSolution1) {
            showSolution1 = true;
            GridStyleStore.addBoxes(1);
            (async () => {
                await waitForElement("solution1")
                solution1Editor = new EditorView({
                    state: EditorState.create({
                        extensions: [basicSetup, keymap.of([indentWithTab]), languageToCodemirrorFunction(languageName1)],
                    }),
                    parent: document.getElementById("solution1"),
                    contentHeight: 100,
                });
            })()
        }
        if (!showTest1) {
            showTest1 = true;
            GridStyleStore.addBoxes(1);
            (async () => {
                await waitForElement("test1")
                test1Editor = new EditorView({
                    state: EditorState.create({
                        extensions: [basicSetup, keymap.of([indentWithTab]), languageToCodemirrorFunction(languageName1)],
                    }),
                    parent: document.getElementById("test1"),
                });
            })()
        }
        (async () => {
            await waitForElement("solution1")
            await waitForElement("test1")
            Split({
                columnGutters: [{
                    track: 1,
                    element: document.querySelector('.gutter-col-1'),
                }, {
                    track: 3,
                    element: document.querySelector('.gutter-col-3'),
                }],
            })
        })()
        showSolutionsAndTestsSelector1 = true
        solutionsAndTasksPromise1 = fetchSolutionsAndTasks(languageName1)
        solutionsAndTasksPromise1.then((data) => {
            solutions1 = data.solutions
            tests1 = data.tests
        })
    }

    function changeLanguage2() {
        infoBoxContent2 = []
        if (!showSolution2) {
            showSolution2 = true;
            GridStyleStore.addBoxes(1);
            (async () => {
                await waitForElement("solution2")
                solution2Editor = new EditorView({
                    state: EditorState.create({
                        extensions: [basicSetup, keymap.of([indentWithTab]), languageToCodemirrorFunction(languageName2)],
                    }),
                    parent: document.getElementById("solution2"),
                });
            })()
        }
        if (!showTest2) {
            showTest2 = true;
            GridStyleStore.addBoxes(1);
            (async () => {
                await waitForElement("test2")
                test2Editor = new EditorView({
                    state: EditorState.create({
                        extensions: [basicSetup, keymap.of([indentWithTab]), languageToCodemirrorFunction(languageName2)],
                    }),
                    parent: document.getElementById("test2"),
                });
            })()
        }
        (async () => {
            await waitForElement("solution2")
            await waitForElement("test2")
            Split({
                columnGutters: [{
                    track: 5,
                    element: document.querySelector('.gutter-col-5'),
                }, {
                    track: 7,
                    element: document.querySelector('.gutter-col-7'),
                }],
            })
        })()
        showSolutionsAndTestsSelector2 = true
        solutionsAndTasksPromise2 = fetchSolutionsAndTasks(languageName2)
        solutionsAndTasksPromise2.then((data) => {
            solutions2 = data.solutions
            tests2 = data.tests
        })
    }

    async function fetchSolutionsAndTasks(language) {
        return fetchJson(`${url}/solutions-tests/${taskId}/${language}`)
    }

    // tests and solutions in editors //

    async function fetchCodeOfTest(id) {
        return fetchJson(`${url}/code-of-test/${id}`)
    }

    async function fetchCodeOfSolution(id) {
        return fetchJson(`${url}/code-of-solution/${id}`)
    }

    function insertSelectedSolution1IntoEditor() {
        infoBoxContent1 = []
        showTest1Result = false
        loadResultFromCache1()
        fetchCodeOfSolution(solutionSelector1).then((data) => {
            let code = data.code
            solution1Editor.dispatch({
                changes: {from: 0, to: solution1Editor.state.doc.length, insert: code}
            })
            solution1Unchanged = code
            solution1FromLastRun = code
        })
    }

    function insertSelectedTest1IntoEditor() {
        infoBoxContent1 = []
        showTest1Result = false
        loadResultFromCache1()
        fetchCodeOfTest(testSelector1).then((data) => {
            let code = data.code
            test1Editor.dispatch({
                changes: {from: 0, to: test1Editor.state.doc.length, insert: code}
            })
            test1Unchanged = code
            test1FromLastRun = code
        })
    }

    function insertSelectedSolution2IntoEditor() {
        infoBoxContent2 = []
        showTest2Result = false
        loadResultFromCache2()
        fetchCodeOfSolution(solutionSelector2).then((data) => {
            let code = data.code
            solution2Editor.dispatch({
                changes: {from: 0, to: solution2Editor.state.doc.length, insert: code}
            })
            solution2Unchanged = code
            solution2FromLastRun = code
        })
    }

    function insertSelectedTest2IntoEditor() {
        infoBoxContent2 = []
        showTest2Result = false
        loadResultFromCache2()
        fetchCodeOfTest(testSelector2).then((data) => {
            let code = data.code
            test2Editor.dispatch({
                changes: {from: 0, to: test2Editor.state.doc.length, insert: code}
            })
            test2Unchanged = code
            test2FromLastRun = code
        })
    }

    // run test and save //

    async function fetchTestResults(solution, solutionId, test, testId, lang, urlParam) {
        const res = await fetch(`${url}/${urlParam}/${lang}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                solution: solution,
                solution_id: parseInt(solutionId),
                test: test,
                test_id: parseInt(testId),
                task_id: parseInt(taskId)
            })
        })
        const data = await res.json()
        if (res.ok) {
            return data
        } else {
            throw new Error(data)
        }
    }

    // run test 1 //

    function runTest1HandleClick() {
        infoBoxContent1 = []

        let solutionInEditor = solution1Editor.state.doc.toString()
        let testInEditor = test1Editor.state.doc.toString()

        if (showTest1Result && solution1FromLastRun === solutionInEditor && testInEditor === test1FromLastRun) {
            infoBoxContent1.push("nothing changed, not running")
            return
        }

        if (solution1FromLastRun !== solutionInEditor && testInEditor !== test1FromLastRun) {
            infoBoxContent1.push("saving solution, test and running")
            promiseTest1Result = fetchTestResults(solutionInEditor, solutionSelector1, testInEditor, testSelector1, languageName1, "test-and-save-solution")
            promiseTest1Result.then(async (data) => {
                solution1FromLastRun = solutionInEditor
                solutionSelector1 = data.solution.id
                solutions1[data.solution.id] = {
                    'date': data.solution.last_modified,
                    'exit_code': data.solution.exit_code
                }
                await waitForElement("solution1-picker-select")
                document.getElementById("solution1-picker-select").value = data.solution.id

                test1FromLastRun = testInEditor
                testSelector1 = data.test_id
                tests1[data.test_id] = {'date': data.test_last_modified, 'final': false}
                await waitForElement("test1-picker-select")
                document.getElementById("test1-picker-select").value = data.test_id
            })

        } else if (solution1FromLastRun !== solutionInEditor && testInEditor === test1FromLastRun) {
            infoBoxContent1.push("saving solution and running")
            promiseTest1Result = fetchTestResults(solutionInEditor, solutionSelector1, testInEditor, testSelector1, languageName1, "test-and-save-both")
            promiseTest1Result.then(async (data) => {
                solution1FromLastRun = solutionInEditor
                solutionSelector1 = data.solution.id
                solutions1[data.solution.id] = {
                    'date': data.solution.last_modified,
                    'exit_code': data.solution.exit_code
                }
                await waitForElement("solution1-picker-select")
                document.getElementById("solution1-picker-select").value = data.solution.id
            })

        } else if (solution1FromLastRun === solutionInEditor && testInEditor !== test1FromLastRun) {
            infoBoxContent1.push("saving test and running")
            promiseTest1Result = fetchTestResults(solutionInEditor, solutionSelector1, testInEditor, testSelector1, languageName1, "test-and-save-test")
            promiseTest1Result.then(async (data) => {
                test1FromLastRun = testInEditor
                testSelector1 = data.test_id
                tests1[data.test_id] = {'date': data.test_last_modified, 'final': false}
                await waitForElement("test1-picker-select")
                document.getElementById("test1-picker-select").value = data.test_id
            })

        } else {
            infoBoxContent1.push("running")
            promiseTest1Result = fetchTestResults(solutionInEditor, solutionSelector1, testInEditor, testSelector1, languageName1, "test")
        }

        showTest1Result = true
        promiseTest1Result.then((res) => {
            testResultsCache.set(paringFunction(solutionSelector1, testSelector1), res)
        })
    }

    // run test 2 //

    function runTest2HandleClick() {
        infoBoxContent2 = []

        let solutionInEditor = solution2Editor.state.doc.toString()
        let testInEditor = test2Editor.state.doc.toString()

        if (showTest2Result && solution2FromLastRun === solutionInEditor && testInEditor === test2FromLastRun) {
            infoBoxContent2.push("nothing changed, not running")
            return
        }

        if (solution2FromLastRun !== solutionInEditor && testInEditor !== test2FromLastRun) {
            infoBoxContent2.push("saving solution, test and running")
            promiseTest2Result = fetchTestResults(solutionInEditor, solutionSelector2, testInEditor, testSelector2, languageName2, "test-and-save-solution")
            promiseTest2Result.then(async (data) => {
                solution2FromLastRun = solutionInEditor
                solutionSelector2 = data.solution.id
                solutions2[data.solution.id] = {
                    'date': data.solution.last_modified,
                    'exit_code': data.solution.exit_code
                }
                await waitForElement("solution2-picker-select")
                document.getElementById("solution2-picker-select").value = data.solution.id

                test2FromLastRun = testInEditor
                testSelector2 = data.test_id
                tests2[data.test_id] = {'date': data.test_last_modified, 'final': false}
                await waitForElement("test2-picker-select")
                document.getElementById("test2-picker-select").value = data.test_id
            })

        } else if (solution2FromLastRun !== solutionInEditor && testInEditor === test2FromLastRun) {
            infoBoxContent2.push("saving solution and running")
            promiseTest2Result = fetchTestResults(solutionInEditor, solutionSelector2, testInEditor, testSelector2, languageName2, "test-and-save-both")
            promiseTest2Result.then(async (data) => {
                solution2FromLastRun = solutionInEditor
                solutionSelector2 = data.solution.id
                solutions2[data.solution.id] = {
                    'date': data.solution.last_modified,
                    'exit_code': data.solution.exit_code
                }
                await waitForElement("solution2-picker-select")
                document.getElementById("solution2-picker-select").value = data.solution.id
            })

        } else if (solution2FromLastRun === solutionInEditor && testInEditor !== test2FromLastRun) {
            infoBoxContent2.push("saving test and running")
            promiseTest2Result = fetchTestResults(solutionInEditor, solutionSelector2, testInEditor, testSelector2, languageName2, "test-and-save-test")
            promiseTest2Result.then(async (data) => {
                test2FromLastRun = testInEditor
                testSelector2 = data.test_id
                tests2[data.test_id] = {'date': data.test_last_modified, 'final': false}
                await waitForElement("test2-picker-select")
                document.getElementById("test2-picker-select").value = data.test_id
            })

        } else {
            infoBoxContent2.push("running")
            promiseTest2Result = fetchTestResults(solutionInEditor, solutionSelector2, testInEditor, testSelector2, languageName2, "test")
        }

        showTest2Result = true
        promiseTest2Result.then((res) => {
            testResultsCache.set(paringFunction(solutionSelector2, testSelector2), res)
        })
    }

    // try loading result from cache //
    function loadResultFromCache1() {
        if (testResultsCache.has(paringFunction(solutionSelector1, testSelector1))) {
            showTest1Result = true
            promiseTest1Result = new Promise((resolve, reject) => {
                resolve(testResultsCache.get(paringFunction(solutionSelector1, testSelector1)))
            })
            promiseTest1Result.then((res) => {
                console.log(res)
            })
        }
    }

    function loadResultFromCache2() {
        if (testResultsCache.has(paringFunction(solutionSelector2, testSelector2))) {
            showTest2Result = true
            promiseTest2Result = new Promise((resolve, reject) => {
                resolve(testResultsCache.get(paringFunction(solutionSelector2, testSelector2)))
            })
            promiseTest2Result.then((res) => {
                console.log(res)
            })
        }
    }

    function hideLanguage(languageNumber) {
        // showSolutionsAndTestsSelector${languageNumber} = false
        showSolutionsAndTestsSelector1 = false
        // eval(`languageName${languageNumber} = ""`)
        languageName1 = ""
        GridStyleStore.removeBoxes(2)
        // eval(`showSolution${languageNumber} = false`)
        // eval(`showTest${languageNumber} = false`)
        showSolution1 = false
        showTest1 = false
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
        <p style="color: red">{error.message}</p>
    {/await}
</div>

<br>
<hr>

<fieldset>
    <legend>Choose filters</legend>
    <div>
        <label>
            <input type="checkbox" bind:checked={showNotFailedSolutions}>
            show only solutions that didn't fail
        </label>
    </div>
    <div>
        <label>
            <input type="checkbox" bind:checked={showFinalTests}>
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
                changeLanguageFunc={changeLanguage1}
                bind:languageName={languageName1}
                languageNumber="1"
                initValues={res}
                hideLanguageFunc={hideLanguage}
        />

        <br>

        {#if showSolutionsAndTestsSelector1}

            <SolutionsAndTestsSelector
                    solutionsAndTasksPromise={solutionsAndTasksPromise1}
                    bind:solutionSelector={solutionSelector1}
                    bind:testSelector={testSelector1}
                    insertSelectedSolutionIntoEditor={insertSelectedSolution1IntoEditor}
                    insertSelectedTestIntoEditor={insertSelectedTest1IntoEditor}
                    solutions={solutions1}
                    tests={tests1}
                    languageNumber="1"
                    showNotFailedSolutions={showNotFailedSolutions}
                    showFinalTests={showFinalTests}
            />

            <!-- language 2 -->

            <LanguageSelector
                    changeLanguageFunc={changeLanguage2}
                    bind:languageName={languageName2}
                    showSolutionsAndTestsSelector={showSolutionsAndTestsSelector2}
                    languageNumber="2"
                    initValues={res}
            />

            <br>

            {#if showSolutionsAndTestsSelector2}
                <SolutionsAndTestsSelector
                        solutionsAndTasksPromise={solutionsAndTasksPromise2}
                        bind:solutionSelector={solutionSelector2}
                        bind:testSelector={testSelector2}
                        insertSelectedSolutionIntoEditor={insertSelectedSolution2IntoEditor}
                        insertSelectedTestIntoEditor={insertSelectedTest2IntoEditor}
                        solutions={solutions2}
                        tests={tests2}
                        languageNumber="2"
                        showNotFailedSolutions={showNotFailedSolutions}
                        showFinalTests={showFinalTests}
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
        showSolution1={showSolution1}
        showTest1={showTest1}
        showSolution2={showSolution2}
        showTest2={showTest2}
        --editor-height={editorHeight}
/>

<!-- test results 1 -->

<br>

<RunLanguagePanel
        languageName={languageName1}
        runTestHandleClick={runTest1HandleClick}
        infoBoxContent={infoBoxContent1}
        showTestResult={showTest1Result}
        promiseTestResult={promiseTest1Result}
        languageNumber="1"
/>

<!-- test results 2 -->

<RunLanguagePanel
        languageName={languageName2}
        runTestHandleClick={runTest2HandleClick}
        infoBoxContent={infoBoxContent2}
        showTestResult={showTest2Result}
        promiseTestResult={promiseTest2Result}
        languageNumber="2"
/>

<!---------------------------------------- styles ---------------------------------------->

<!-- css variables -->

<!--<div style="&#45;&#45;editor-height: {editorHeight}"></div>-->

<style>
    .selector label {
        display: inline;
        padding-right: 4px;
    }

    .selector select {
        margin-top: 4px;
    }
</style>

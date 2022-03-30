<script>
    import Split from 'split-grid'
    import {basicSetup, EditorState} from "@codemirror/basic-setup"
    import {EditorView, keymap} from "@codemirror/view"
    import {indentWithTab} from "@codemirror/commands"
    import {go} from "@codemirror/legacy-modes/mode/go"
    import {StreamLanguage} from "@codemirror/stream-parser"
    import {python} from "@codemirror/lang-python"
    import {Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader,} from 'sveltestrap'
    import * as store from "./store"
    import {get} from "svelte/store";

    // variables //

    let url = get(store.url)

    let openSolution1Name = false, openTest1Name = false, openSolution2Name = false, openTest2Name = false
    const toggleSolution1Name = () => (openSolution1Name = !openSolution1Name)
    const toggleTest1Name = () => (openTest1Name = !openTest1Name)
    const toggleSolution2Name = () => (openSolution2Name = !openSolution2Name)
    const toggleTest2Name = () => (openTest2Name = !openTest2Name)
    let solution1Name = "", test1Name = "", solution2Name = "", test2Name = ""

    const taskId = new URLSearchParams(window.location.search).get('id')
    const initValues = getInitValues()

    let languageName1 = "", languageName2 = ""

    let showNotFailedSolutions = false, showFinalTests = false

    let solution1Editor, test1Editor, solution2Editor, test2Editor

    let test1FromLastRun = "", test1Unchanged = "", test2FromLastRun = "", test2Unchanged = ""
    let solution1FromLastRun = "", solution1Unchanged = "", solution2FromLastRun = "", solution2Unchanged = ""

    let showTest1 = false, showTest2 = false, showSolution1 = false, showSolution2 = false

    let gridStyle = ""
    let numberOfEditors = 0
    $: if (numberOfEditors) {
        gridStyle = "1fr " + "10px 1fr ".repeat(Math.max(0, numberOfEditors - 1))
    }

    let showSolutionsAndTestsSelector1 = false, showSolutionsAndTestsSelector2 = false
    let solutionSelector1 = 0, solutionSelector2 = 0, testSelector1 = 0, testSelector2 = 0
    let solutionsAndTasks1 = Promise.resolve([]), solutionsAndTasks2 = Promise.resolve([])

    let showTest1Result = false, showTest2Result = false
    let promiseTest1Result = Promise.resolve([]), promiseTest2Result = Promise.resolve([])

    let tests1 = new Map(), tests2 = new Map(), solutions1 = new Map(), solutions2 = new Map()

    let widthSolution1 = 0, widthTest1 = 0, widthSolution2 = 0, widthTest2 = 0
    const widthConstant = 0.96

    let infoBoxContent1 = []
    let infoBoxContent2 = []

    let testResultsCache = new Map()

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
        numberOfEditors++
        if (!showSolution1) {
            showSolution1 = true
            numberOfEditors++
            (async () => {
                await waitForElement("solution1")
                solution1Editor = new EditorView({
                    state: EditorState.create({
                        extensions: [basicSetup, keymap.of([indentWithTab]), languageToCodemirrorFunction(languageName1)],
                    }),
                    parent: document.getElementById("solution1"),
                });
            })()
        }
        if (!showTest1) {
            showTest1 = true
            numberOfEditors++
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
        solutionsAndTasks1 = fetchSolutionsAndTasks(languageName1)
        solutionsAndTasks1.then((data) => {
            solutions1 = data.solutions
            tests1 = data.tests
        })
    }

    function changeLanguage2() {
        infoBoxContent2 = []
        if (!showSolution2) {
            showSolution2 = true
            numberOfEditors++
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
            showTest2 = true
            numberOfEditors++
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
        solutionsAndTasks2 = fetchSolutionsAndTasks(languageName2)
        solutionsAndTasks2.then((data) => {
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

</script>

<!---------------------------------------- html starts here ---------------------------------------->

<!-- initial info -->

<div class="title">
    {#await initValues}
        <p>Loading title...</p>
    {:then res}
        <h1>{res.title} ({res.difficulty})</h1>
        <p><b>Added on:</b> {res.added_on}</p>
        <p><b>Author:</b> {res.author}</p>
        <p><b>Approver:</b> {res.approver}</p>
    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}
</div>

<br>

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

        <label for="language1-picker-select"><b>First language:</b></label>
        <select name="language1-picker-select" id="language1-picker-select" bind:value={languageName1}
                on:change={changeLanguage1}>
            {#each res.languages as lang}
                <option value={lang}>{lang}</option>
            {/each}
        </select>

        &nbsp;
        {#if showSolutionsAndTestsSelector1}
            {#await solutionsAndTasks1}
                <p>Loading Solutions...</p>
            {:then res}
                <label for="solution1-picker-select"><b>Select from solutions:</b></label>
                <select name="solution1-picker-select" id="solution1-picker-select" bind:value={solutionSelector1}
                        on:change={insertSelectedSolution1IntoEditor}>
                    {#each Object.entries(solutions1) as [id, info]}
                        {#if info.exit_code === 0 || !showNotFailedSolutions }
                            <option value={id} class="{info.exit_code !== 0 ? 'error-msg' : ''}">{info.date}
                                <span>{info.exit_code !== 0 ? '(failed)' : ''}</span></option>
                        {/if}
                    {/each}
                </select>

                &nbsp;

                <Button color="secondary" class="btn-sm" on:click={toggleSolution1Name}>Change name</Button>
                <Modal isOpen={openSolution1Name} {toggleSolution1Name}>
                    <ModalHeader {toggleSolution1Name}>Change name</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label for="changeSolution1Name">Name</Label>
                            <Input bind:value={solution1Name} id="changeSolution1Name" placeholder="type name here"/>
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" on:click={toggleSolution1Name}>Change</Button>
                        <Button color="secondary" on:click={toggleSolution1Name}>Cancel</Button>
                    </ModalFooter>
                </Modal>
                &nbsp;

                <label for="test1-picker-select"><b>Select from test:</b></label>
                <select name="test1-picker-select" id="test1-picker-select" bind:value={testSelector1}
                        on:change={insertSelectedTest1IntoEditor}>
                    {#each Object.entries(tests1) as [id, info]}
                        {#if !showFinalTests || info.final}
                            <option value={id} class="{info.final ? 'error-msg' : ''}">{info.date}
                                <span>{info.final ? '(final)' : ''}</span></option>
                        {/if}
                    {/each}
                </select>

                &nbsp;

                <Button color="secondary" class="btn-sm" on:click={toggleTest1Name}>Change name</Button>
                <Modal isOpen={openTest1Name} {toggleTest1Name}>
                    <ModalHeader {toggleTest1Name}>Change name</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label for="changeTest1Name">Name</Label>
                            <Input bind:value={test1Name} id="changeTest1Name" placeholder="type name here"/>
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" on:click={toggleTest1Name}>Change</Button>
                        <Button color="secondary" on:click={toggleTest1Name}>Cancel</Button>
                    </ModalFooter>
                </Modal>

            {:catch error}
                <p style="color: red">{error.message}</p>
            {/await}

            <br>
            <!-- language 2 -->

            <label for="language2-picker-select"><b>Second language:</b></label>
            <select name="language2-picker-select" id="language2-picker-select" bind:value={languageName2}
                    on:change={changeLanguage2}>
                {#each res.languages as lang}
                    <option value={lang}>{lang}</option>
                {/each}
            </select>

            {#if showSolutionsAndTestsSelector2}
                {#await solutionsAndTasks2}
                    <p>Loading Solutions...</p>
                {:then res}
                    <label for="solution2-picker-select"><b>Select from solutions:</b></label>
                    <select name="solution2-picker-select" id="solution2-picker-select"
                            bind:value={solutionSelector2}
                            on:change={insertSelectedSolution2IntoEditor}>
                        {#each Object.entries(solutions2) as [id, info]}
                            {#if info.exit_code === 0 || !showNotFailedSolutions }
                                <option value={id} class="{info.exit_code !== 0 ? 'error-msg' : ''}">{info.date}
                                    <span>{info.exit_code !== 0 ? '(failed)' : ''}</span></option>
                            {/if}
                        {/each}
                    </select>

                    &nbsp;

                    <Button color="secondary" class="btn-sm" on:click={toggleSolution2Name}>Change name
                    </Button>
                    <Modal isOpen={openSolution2Name} {toggleSolution2Name}>
                        <ModalHeader {toggleSolution2Name}>Change name</ModalHeader>
                        <ModalBody>
                            <FormGroup>
                                <Label for="changeSolution2Name">Name</Label>
                                <Input bind:value={solution2Name} id="changeSolution2Name"
                                       placeholder="type name here"/>
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" on:click={toggleSolution2Name}>Change</Button>
                            <Button color="secondary" on:click={toggleSolution2Name}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                    &nbsp;

                    <label for="test2-picker-select"><b>Select from test:</b></label>
                    <select name="test2-picker-select" id="test2-picker-select" bind:value={testSelector2}
                            on:change={insertSelectedTest2IntoEditor}>
                        {#each Object.entries(tests2) as [id, info]}
                            {#if !showFinalTests || info.final}
                                <option value={id} class="{info.final ? 'error-msg' : ''}">{info.date}
                                    <span>{info.final ? '(final)' : ''}</span></option>
                            {/if}
                        {/each}
                    </select>

                    &nbsp;

                    <Button color="secondary" class="btn-sm" on:click={toggleTest2Name}>Change name</Button>
                    <Modal isOpen={openTest2Name} {toggleTest2Name}>
                        <ModalHeader {toggleTest2Name}>Change name</ModalHeader>
                        <ModalBody>
                            <FormGroup>
                                <Label for="changeTest2Name">Name</Label>
                                <Input bind:value={test2Name} id="changeTest2Name" placeholder="type name here"/>
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" on:click={toggleTest2Name}>Change</Button>
                            <Button color="secondary" on:click={toggleTest2Name}>Cancel</Button>
                        </ModalFooter>
                    </Modal>

                {:catch error}
                    <p style="color: red">{error.message}</p>
                {/await}
            {/if}
        {/if}

    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}
</div>

<br>

<!-- editor boxes -->

<div class="grid" style="grid-template-columns: {gridStyle}">
    {#await initValues}
        <div>Loading description...</div>
    {:then res}
        <div>
            <p>
                {res.text}
            </p>
        </div>
    {:catch error}
        <div style="color: red">{error.message}</div>
    {/await}

    {#if showSolution1}
        <div class="gutter-col gutter-col-1">
            <div class="vl"></div>
        </div>
        <div bind:clientWidth={widthSolution1}>
            <div id="solution1" style="width: {widthSolution1*widthConstant}px"></div>
        </div>
    {/if}

    {#if showTest1}
        <div class="gutter-col gutter-col-3">
            <div class="vl"></div>
        </div>
        <div bind:clientWidth={widthTest1}>
            <div id="test1" style="width: {widthTest1*widthConstant}px"></div>
        </div>
    {/if}

    {#if showSolution2}
        <div class="gutter-col gutter-col-5">
            <div class="vl"></div>
        </div>
        <div bind:clientWidth={widthSolution2}>
            <div id="solution2" style="width: {widthSolution2*widthConstant}px"></div>
        </div>
    {/if}

    {#if showTest2}
        <div class="gutter-col gutter-col-7">
            <div class="vl"></div>
        </div>
        <div bind:clientWidth={widthTest2}>
            <div id="test2" style="width: {widthTest2*widthConstant}px"></div>
        </div>
    {/if}
</div>

<!-- test results 1 -->

<br>

{#if languageName1}
    <div id="test-result-1">
        <button type="button" on:click={runTest1HandleClick}>
            Run 1. language
        </button>

        <br><br>
        <!-- info box -->
        <div class="info-box">
            {#each infoBoxContent1 as line}
                {line}<br>
            {/each}
        </div>
        <br>

        {#if showTest1Result}
            {#await promiseTest1Result}
                <p>loading...</p>
            {:then res}
                {#if res.solution.exit_code === 1}
                    <p class="error-msg"><b>couldn't compile</b></p>
                    <div class="test-output">{res.solution.output.replaceAll('^', '\n')}</div>
                {:else}
                    {#if res.solution.exit_code === 2}
                        <p class="error-msg"><b>test failed</b></p>
                        <div class="test-output">{res.solution.output.replaceAll('^', '\n')}</div>
                    {:else}
                        <p class="success-msg"><b>test OK</b></p>
                        <p>compilation time: {res.solution.compilation_time} s</p>
                        <p>real time: {res.solution.real_time} s</p>
                        <p>kernel time: {res.solution.kernel_time} s</p>
                        <p>user time: {res.solution.user_time} s</p>
                        <p>max ram usage: {res.solution.max_ram_usage} mb</p>
                        <p>binary size: {res.solution.binary_size} mb</p>
                        <p>test output:</p>
                        <div class="test-output">{res.solution.output.replaceAll('^', '\n')}</div>
                    {/if}
                {/if}
            {:catch error}
                <p style="color: red">{error.message}</p>
            {/await}
        {/if}
    </div>
{/if}

<!-- test results 2 -->

{#if languageName2}
    <div id="test-result-2">
        <button type="button" on:click={runTest2HandleClick}>
            Run 2. language
        </button>

        <br><br>
        <!-- info box -->
        <div class="info-box">
            {#each infoBoxContent2 as line}
                {line}<br>
            {/each}
        </div>
        <br>

        {#if showTest2Result}
            {#await promiseTest2Result}
                <p>loading...</p>
            {:then res}
                {#if res.solution.exit_code === 1}
                    <p class="error-msg"><b>couldn't compile</b></p>
                    <div class="test-output">{res.solution.output.replaceAll('^', '\n')}</div>
                {:else}
                    {#if res.solution.exit_code === 2}
                        <p class="error-msg"><b>test failed</b></p>
                        <div class="test-output">{res.solution.output.replaceAll('^', '\n')}</div>
                    {:else}
                        <p class="success-msg"><b>test OK</b></p>
                        <p>compilation time: {res.solution.compilation_time} s</p>
                        <p>real time: {res.solution.real_time} s</p>
                        <p>kernel time: {res.solution.kernel_time} s</p>
                        <p>user time: {res.solution.user_time} s</p>
                        <p>max ram usage: {res.solution.max_ram_usage} mb</p>
                        <p>binary size: {res.solution.binary_size} mb</p>
                        <p>test output:</p>
                        <div class="test-output">{res.solution.output.replaceAll('^', '\n')}</div>
                    {/if}
                {/if}
            {:catch error}
                <p style="color: red">{error.message}</p>
            {/await}
        {/if}
    </div>
{/if}

<!---------------------------------------- styles ---------------------------------------->

<!-- css variables -->

<style>
    .selector label {
        display: inline;
        padding-right: 4px;
    }

    .selector select {
        margin-top: 4px;
    }

    .box textarea {
        overflow-y: scroll;
        overflow-x: scroll;
        /*height: 100px;*/
        /*width: 400px;*/
        /*resize: none;*/
        resize: vertical;
        resize: horizontal;
        /*resize: both;*/
        white-space: nowrap;
    }

    .remove-text {
        border-style: solid;
        border-width: thin;
        color: brown;
        padding: 0.1%;
    }

    .reset-text {
        border-style: solid;
        border-width: thin;
        color: darkgoldenrod;
        padding: 0.1%;
    }

    #test-result-1 {
        float: left;
        width: 50%;
    }

    #test-result-2 {
        float: right;
        width: 45%;
    }

    .test-output {
        white-space: pre-wrap;
        border-style: solid;
        border-width: thin;
    }

    .error-msg {
        color: red;
    }

    .success-msg {
        color: green;
    }

    .vl {
        border-left: 4px solid indianred;
        height: 500px;
    }

    .grid {
        display: grid;
    }

    .gutter-col {
        grid-row: 1/-1;
        cursor: col-resize;
    }

    .gutter-col-1 {
        grid-column: 2;
    }

    .gutter-col-3 {
        grid-column: 4;
    }

    .gutter-col-5 {
        grid-column: 6;
    }

    .gutter-col-7 {
        grid-column: 8;
    }

    :global(.cm-scroller) {
        overflow: auto;
        max-height: 400px !important;
    }

</style>

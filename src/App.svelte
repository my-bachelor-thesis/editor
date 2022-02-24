<script>
    import Split from 'split-grid'
    import {EditorState, basicSetup} from "@codemirror/basic-setup"
    import {EditorView, keymap} from "@codemirror/view"
    import {indentWithTab} from "@codemirror/commands"
    import {go} from "@codemirror/legacy-modes/mode/go"
    import {StreamLanguage} from "@codemirror/stream-parser"
    import {python} from "@codemirror/lang-python"

    // variables //

    const taskId = new URLSearchParams(window.location.search).get('id')
    const initValues = getInitValues()

    let languageName1 = ""
    let languageName2 = ""

    let solution1Editor = ""
    let test1Editor = ""
    // $: solution1 = (typeof solution1Editor) === "object" ? solution1Editor.state.doc.toString() : ""
    // $: test1 = (typeof test1Editor) === "object" ? test1Editor.state.doc.toString() : ""
    let test1FromLastRun = "", test1Unchanged = "", test2FromLastRun = "", test2Unchanged = ""
    let solution1FromLastRun = "", solution1Unchanged = "", solution2FromLastRun = "", solution2Unchanged = ""

    let showTest1 = false, showTest2 = false, showSolution1 = false, showSolution2 = false

    let numberOfEditors = 0
    let gridStyle = ""

    let showSolutionsAndTestsSelector1 = false, showSolutionsAndTestsSelector2 = false
    let solutionSelector1 = 0, solutionSelector2 = 0, testSelector1 = 0, testSelector2 = 0
    let solutionsAndTasks1 = Promise.resolve([]), solutionsAndTasks2 = Promise.resolve([])

    let showTest1Result = false, showTest2Result = false
    let promiseTest1Result = Promise.resolve([]), promiseTest2Result = Promise.resolve([])

    let tests1 = new Map(), tests2 = new Map(), solutions1 = new Map(), solutions2 = new Map()

    // helper functions //

    function languageToCodemirrorFunction(language) {
        switch (language){
            case 'go':
                return StreamLanguage.define(go)
            case 'python':
                return python()
        }

    }

    function updateGridStyle() {
        gridStyle = "1fr " + "10px 1fr ".repeat(Math.max(0, numberOfEditors - 1))
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
        return fetchJson(`http://localhost:9000/init-data/${taskId}`)
    }

    // tests and solutions //

    async function fetchCodeOfTest(id) {
        return fetchJson(`http://localhost:9000/code-of-test/${id}`)
    }

    async function fetchCodeOfSolution(id) {
        return fetchJson(`http://localhost:9000/code-of-solution/${id}`)
    }

    function setSolution1() {
        fetchCodeOfSolution(solutionSelector1).then((data) => {
            let code = data.code
            solution1Editor.dispatch({
                changes: {from: 0, to: solution1Editor.state.doc.length, insert: code}
            })
            solution1Unchanged = code
            solution1FromLastRun = code
        })
    }

    function setTest1() {
        fetchCodeOfTest(testSelector1).then((data) => {
            let code = data.code
            test1Editor.dispatch({
                changes: {from: 0, to: test1Editor.state.doc.length, insert: code}
            })
            test1Unchanged = code
            test1FromLastRun = code
        })
    }

    // function setSolution2() {
    //     fetchCodeOfSolution(solutionSelector2).then((data) => {
    //         solution2 = data.code
    //         prevSolution2 = solution2
    //     })
    // }
    //
    // function setTest2() {
    //     fetchCodeOfTest(testSelector2).then((data) => {
    //         test2 = data.code
    //         prevTest2 = test2
    //     })
    // }

    // function resetTest1() {
    //     test1 = prevTest1
    //     if (!showTest1) {
    //         showTest1 = true
    //         numberOfBoxes++
    //         resizeBoxSize()
    //     }
    // }
    //
    // function resetTest2() {
    //     test2 = prevTest2
    //     if (!showTest2) {
    //         showTest2 = true
    //         numberOfBoxes++
    //         resizeBoxSize()
    //     }
    // }
    //
    // function resetSolution1() {
    //     solution1 = prevSolution1
    //     if (!showSolution1) {
    //         showSolution1 = true
    //         numberOfBoxes++
    //         resizeBoxSize()
    //     }
    // }
    //
    // function resetSolution2() {
    //     solution2 = prevSolution2
    //     if (!showSolution2) {
    //         showSolution2 = true
    //         numberOfBoxes++
    //         resizeBoxSize()
    //     }
    // }

    // change language//

    function changeLanguage1() {
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
            updateGridStyle()
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

    // function changeLanguage2() {
    //     if (!showSolution2) {
    //         showSolution2 = true
    //         numberOfBoxes++
    //     }
    //     if (!showTest2) {
    //         showTest2 = true
    //         numberOfBoxes++
    //     }
    //     showSolutionsAndTestsSelector2 = true
    //     solutionsAndTasks2 = fetchSolutionsAndTasks(languageName2)
    //     solutionsAndTasks2.then((data) => {
    //         solutions2 = data.solutions
    //         tests2 = data.tests
    //         resizeBoxSize()
    //     })
    // }

    async function fetchSolutionsAndTasks(language) {
        return fetchJson(`http://localhost:9000/solutions-tests/${taskId}/${language}`)
    }

    // run test //

    async function fetchTestResults(solution, solutionId, test, testId, lang, urlParam = "test") {
        const res = await fetch(`http://localhost:9000/${urlParam}/${lang}`, {
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
        showTest1Result = true
        promiseTest1Result = fetchTestResults(solution1Editor.state.doc.toString(), solutionSelector1, test1Editor.state.doc.toString(), testSelector1, languageName1)
    }

    // function runTest1AndSave(urlParam) {
    //     showTest1Result = true
    //     promiseTest1Result = fetchTestResults(solution1, solutionSelector1, test1, testSelector1, languageName1, urlParam)
    // }
    //
    // function runTest1AndSaveSolutionHandleClick() {
    //     runTest1AndSave("test-and-save-solution")
    //     promiseTest1Result.then(async (data) => {
    //         solutionSelector1 = data.solution.id
    //         solutions1[data.solution.id] = {'date': data.solution.last_modified, 'exit_code': data.solution.exit_code}
    //         prevSolution1 = solution1
    //         await new Promise(r => setTimeout(r, 50));
    //         document.getElementById("solution1-picker-select").value = data.solution.id
    //     })
    // }
    //
    // function runTest1AndSaveTestHandleClick() {
    //     runTest1AndSave("test-and-save-test")
    //     promiseTest1Result.then(async (data) => {
    //         testSelector1 = data.test.id
    //         tests1[data.test.id] = {'date': data.test.last_modified, 'final': data.test.final}
    //         prevTest1 = test1
    //         await new Promise(r => setTimeout(r, 50));
    //         document.getElementById("test1-picker-select").value = data.test.id
    //     })
    // }
    //
    // function runTest1AndSaveBothHandleClick() {
    //     runTest1AndSave("test-and-save-both")
    //     promiseTest1Result.then(async (data) => {
    //         testSelector1 = data.test.id
    //         tests1[data.test.id] = {'date': data.test.last_modified, 'final': data.test.final}
    //         prevTest1 = test1
    //         await new Promise(r => setTimeout(r, 50));
    //         document.getElementById("test1-picker-select").value = data.test.id
    //
    //         solutionSelector1 = data.solution.id
    //         solutions1[data.solution.id] = {'date': data.solution.last_modified, 'exit_code': data.solution.exit_code}
    //         prevSolution1 = solution1
    //         await new Promise(r => setTimeout(r, 50));
    //         document.getElementById("solution1-picker-select").value = data.solution.id
    //     })
    // }

    // run test 2 //

    // function runTest2HandleClick() {
    //     showTest2Result = true
    //     promiseTest2Result = fetchTestResults(solution2, solutionSelector2, test2, testSelector2, languageName2)
    // }
    //
    // function runTest2AndSave(urlParam) {
    //     showTest2Result = true
    //     promiseTest2Result = fetchTestResults(solution2, solutionSelector2, test2, testSelector2, languageName2, urlParam)
    // }
    //
    // function runTest2AndSaveSolutionHandleClick() {
    //     runTest2AndSave("test-and-save-solution")
    //     promiseTest2Result.then(async (data) => {
    //         solutionSelector2 = data.solution.id
    //         solutions2[data.solution.id] = {'date': data.solution.last_modified, 'exit_code': data.solution.exit_code}
    //         prevSolution2 = solution2
    //         await new Promise(r => setTimeout(r, 50));
    //         document.getElementById("solution2-picker-select").value = data.solution.id
    //     })
    // }

    // function runTest2AndSaveTestHandleClick() {
    //     runTest2AndSave("test-and-save-test")
    //     promiseTest2Result.then(async (data) => {
    //         testSelector2 = data.test.id
    //         tests2[data.test.id] = {'date': data.test.last_modified, 'final': data.test.final}
    //         prevTest2 = test2
    //         await new Promise(r => setTimeout(r, 50));
    //         document.getElementById("test2-picker-select").value = data.test.id
    //     })
    // }
    //
    // function runTest2AndSaveBothHandleClick() {
    //     runTest2AndSave("test-and-save-both")
    //     promiseTest2Result.then(async (data) => {
    //         testSelector2 = data.test.id
    //         tests2[data.test.id] = {'date': data.test.last_modified, 'final': data.test.final}
    //         prevTest2 = test2
    //         await new Promise(r => setTimeout(r, 50));
    //         document.getElementById("test2-picker-select").value = data.test.id
    //
    //         solutionSelector2 = data.solution.id
    //         solutions2[data.solution.id] = {'date': data.solution.last_modified, 'exit_code': data.solution.exit_code}
    //         prevSolution2 = solution2
    //         await new Promise(r => setTimeout(r, 50));
    //         document.getElementById("solution2-picker-select").value = data.solution.id
    //     })
    // }

    // initial loading //


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

<!-- selectors -->

<div class="selector">
    {#await initValues}
        <p>Loading languages...</p>
    {:then res}
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
                        on:change={setSolution1}>
                    {#each Object.entries(solutions1) as [id, info]}
                        <option value={id} class="{info.exit_code != 0 ? 'error-msg' : ''}">{info.date}
                            <span>{info.exit_code != 0 ? '(failed)' : ''}</span></option>
                    {/each}
                </select>

                &nbsp;
                <!--                <span class="reset-text" on:click={resetSolution1}>click to reset solution</span>-->
                &nbsp;

                <label for="test1-picker-select"><b>Select from test:</b></label>
                <select name="test1-picker-select" id="test1-picker-select" bind:value={testSelector1}
                        on:change={setTest1}>
                    {#each Object.entries(tests1) as [id, info]}
                        <option value={id} class="{info.final ? 'error-msg' : ''}">{info.date}
                            <span>{info.final ? '(final)' : ''}</span></option>
                    {/each}
                </select>

                &nbsp;
                <!--                <span class="reset-text" on:click={resetTest1}>click to reset test</span>-->
            {:catch error}
                <p style="color: red">{error.message}</p>
            {/await}
        {/if}

        <br>

        <!--        <label for="language2-picker-select"><b>First language:</b></label>-->
        <!--        <select name="language2-picker-select" id="language2-picker-select" bind:value={languageName2}-->
        <!--                on:change={changeLanguage2}>-->
        <!--            {#each res.languages as lang}-->
        <!--                <option value={lang}>{lang}</option>-->
        <!--            {/each}-->
        <!--        </select>-->

        <!--        {#if showSolutionsAndTestsSelector2}-->
        <!--            {#await solutionsAndTasks2}-->
        <!--                <p>Loading Solutions...</p>-->
        <!--            {:then res}-->
        <!--                <label for="solution2-picker-select"><b>Select from solutions:</b></label>-->
        <!--                <select name="solution2-picker-select" id="solution2-picker-select" bind:value={solutionSelector2}-->
        <!--                        on:change={setSolution2}>-->
        <!--                    {#each Object.entries(solutions2) as [id, info]}-->
        <!--                        <option value={id} class="{info.exit_code != 0 ? 'error-msg' : ''}">{info.date}-->
        <!--                            <span>{info.exit_code != 0 ? '(failed)' : ''}</span></option>-->
        <!--                    {/each}-->
        <!--                </select>-->

        <!--                &nbsp;-->
        <!--                <span class="reset-text" on:click={resetSolution2}>click to reset solution</span>-->
        <!--                &nbsp;-->

        <!--                <label for="test2-picker-select"><b>Select from test:</b></label>-->
        <!--                <select name="test2-picker-select" id="test2-picker-select" bind:value={testSelector2}-->
        <!--                        on:change={setTest2}>-->
        <!--                    <option value=null selected disabled>pick</option>-->
        <!--                    {#each Object.entries(tests2) as [id, info]}-->
        <!--                        <option value={id} class="{info.final ? 'error-msg' : ''}">{info.date}-->
        <!--                            <span>{info.final ? '(final)' : ''}</span></option>-->
        <!--                    {/each}-->
        <!--                </select>-->

        <!--                &nbsp;-->
        <!--                <span class="reset-text" on:click={resetTest2}>click to reset test</span>-->
        <!--            {:catch error}-->
        <!--                <p style="color: red">{error.message}</p>-->
        <!--            {/await}-->
        <!--        {/if}-->

    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}
</div>

<!-- editor boxes -->

<div class="grid" style="grid-template-columns: {gridStyle}">
    {#await initValues}
        <div>Loading description...</div>
    {:then res}
        <div>
            <p>
                {res.text}
            </p>
            <!--            <div class="box">-->
            <!--                <p><b>description</b></p>-->
            <!--                <textarea readonly style="white-space: normal;width: 200px; height: 300px;">{res.text}</textarea>-->
            <!--            </div>-->
        </div>
    {:catch error}
        <div style="color: red">{error.message}</div>
    {/await}

    {#if showSolution1}
        <!--            <p><b>solution 1</b>&nbsp;<span class="remove-text"-->
        <!--                                            on:click={() => {showSolution1 = false;numberOfBoxes&#45;&#45;;resizeBoxSize()}}>click to remove</span>-->
        <!--            </p>-->
        <div class="gutter-col gutter-col-1">
            <div class="vl"></div>
        </div>
        <div>
            <div id="solution1"></div>
        </div>
    {/if}

    {#if showTest1}
        <!--            <p><b>test 1</b>&nbsp;<span class="remove-text"-->
        <!--                                        on:click={() => {showTest1 = false;numberOfBoxes&#45;&#45;;resizeBoxSize()}}>click to remove</span>-->
        <!--            </p>-->
        <div class="gutter-col gutter-col-3">
            <div class="vl"></div>
        </div>
        <div>
            <div id="test1"></div>
        </div>
    {/if}

    {#if showSolution2}
        <!--            <p><b>solution 2</b>&nbsp;<span class="remove-text"-->
        <!--                                            on:click={() => {showSolution2 = false;numberOfBoxes&#45;&#45;;resizeBoxSize()}}>click to remove</span>-->
        <!--            </p>-->
        <div class="gutter-col gutter-col-5">
            <div class="vl"></div>
        </div>
        <div>
            <div id="solution2"></div>
        </div>
    {/if}

    {#if showTest2}
        <!--            <p><b>test 2</b>&nbsp;<span class="remove-text"-->
        <!--                                        on:click={() => {showTest2 = false;numberOfBoxes&#45;&#45;;resizeBoxSize()}}>click to remove</span>-->
        <!--            </p>-->
        <div class="gutter-col gutter-col-7">
            <div class="vl"></div>
        </div>
        <div>
            <div id="test2"></div>
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

        <!--        <button type="button" on:click={runTest1AndSaveSolutionHandleClick}>-->
        <!--            Run and save solution-->
        <!--        </button>-->

        <!--        <button type="button" on:click={runTest1AndSaveTestHandleClick}>-->
        <!--            Run and save test-->
        <!--        </button>-->

        <!--        <button type="button" on:click={runTest1AndSaveBothHandleClick}>-->
        <!--            Run and save both-->
        <!--        </button>-->

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

<!--{#if languageName2}-->
<!--    <div id="test-result-2">-->
<!--        <button type="button" on:click={runTest2HandleClick}>-->
<!--            Run 2. language-->
<!--        </button>-->

<!--        <button type="button" on:click={runTest2AndSaveSolutionHandleClick}>-->
<!--            Run and save solution-->
<!--        </button>-->

<!--        <button type="button" on:click={runTest2AndSaveTestHandleClick}>-->
<!--            Run and save test-->
<!--        </button>-->

<!--        <button type="button" on:click={runTest2AndSaveBothHandleClick}>-->
<!--            Run and save both-->
<!--        </button>-->

<!--        <br>-->

<!--        {#if showTest2Result}-->
<!--            {#await promiseTest2Result}-->
<!--                <p>loading...</p>-->
<!--            {:then res}-->
<!--                {#if res.solution.exit_code === 1}-->
<!--                    <p class="error-msg"><b>couldn't compile</b></p>-->
<!--                    <div class="test-output">{res.solution.output.replaceAll('^', '\n')}</div>-->
<!--                {:else}-->
<!--                    {#if res.solution.exit_code === 2}-->
<!--                        <p class="error-msg"><b>test failed</b></p>-->
<!--                        <div class="test-output">{res.solution.output.replaceAll('^', '\n')}</div>-->
<!--                    {:else}-->
<!--                        <p class="success-msg"><b>test OK</b></p>-->
<!--                        <p>compilation time: {res.solution.compilation_time} s</p>-->
<!--                        <p>real time: {res.solution.real_time} s</p>-->
<!--                        <p>kernel time: {res.solution.kernel_time} s</p>-->
<!--                        <p>user time: {res.solution.user_time} s</p>-->
<!--                        <p>max ram usage: {res.solution.max_ram_usage} mb</p>-->
<!--                        <p>binary size: {res.solution.binary_size} mb</p>-->
<!--                        <p>test output:</p>-->
<!--                        <div class="test-output">{res.solution.output.replaceAll('^', '\n')}</div>-->
<!--                    {/if}-->
<!--                {/if}-->
<!--            {:catch error}-->
<!--                <p style="color: red">{error.message}</p>-->
<!--            {/await}-->
<!--        {/if}-->
<!--    </div>-->
<!--{/if}-->

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

    .box {
        display: inline-block;
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

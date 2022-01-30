<script>
    import {onMount} from 'svelte';

    // variables //

    const taskId = new URLSearchParams(window.location.search).get('id')
    const initValues = getInitValues()

    let languageName1 = ""
    let languageName2 = ""
    let test1 = ""
    let prevTest1 = ""
    let test2 = ""
    let prevTest2 = ""
    let solution1 = ""
    let prevSolution1 = ""
    let solution2 = ""
    let prevSolution2 = ""
    let showTest1 = false
    let showSolution1 = false

    let numberOfBoxes = 1
    let boxWidth = 0
    let boxHeight = 0

    let showSolutionsAndTestsSelector = false
    let solutionSelector1 = ""
    let testSelector1 = ""
    let solutionsAndTasks = Promise.resolve([])

    let showTest1Result = false
    let promiseTest1Result = Promise.resolve([])
    let showTest2Result = false
    let promiseTest2Result = Promise.resolve([])

    // tests and solutions //

    async function fetchCodeOfTest(id) {
        const res = await fetch(`http://localhost:9000/code-of-test/${id}`)
        const data = await res.json()
        if (res.ok) {
            return data
        } else {
            throw new Error(data)
        }
    }

    async function fetchCodeOfSolution(id) {
        const res = await fetch(`http://localhost:9000/code-of-solution/${id}`)
        const data = await res.json()
        if (res.ok) {
            return data
        } else {
            throw new Error(data)
        }
    }

    function setTest1() {
        fetchCodeOfTest(testSelector1).then((data) => {
            test1 = data.code
            prevTest1 = test1
        })
    }

    function setSolution1() {
        fetchCodeOfSolution(solutionSelector1).then((data) => {
            solution1 = data.code
            prevSolution1 = solution1
        })
    }

    function resetTest1() {
        test1 = prevTest1
        if (!showTest1) {
            showTest1 = true
            numberOfBoxes++
            resizeBoxSize()
        }
    }

    function resetSolution1() {
        solution1 = prevSolution1
        if (!showSolution1) {
            showSolution1 = true
            numberOfBoxes++
            resizeBoxSize()
        }
    }

    // change language//

    function changeLanguage1() {
        if (!showSolution1) {
            showSolution1 = true
            numberOfBoxes++
        }
        if (!showTest1) {
            showTest1 = true
            numberOfBoxes++
        }
        showSolutionsAndTestsSelector = true
        solutionsAndTasks = fetchSolutionsAndTasks(languageName1)
        resizeBoxSize()
    }

    function changeLanguage2() {
        // do something
    }

    async function fetchSolutionsAndTasks(language) {
        const res = await fetch(`http://localhost:9000/solutions-tests/${taskId}/${language}`)
        const data = await res.json()
        if (res.ok) {
            return data
        } else {
            throw new Error(data)
        }
    }

    // resize boxes //

    function resizeBoxSize() {
        boxWidth = window.innerWidth / (1.01 + 0.01 * numberOfBoxes) / numberOfBoxes
        boxHeight = window.innerHeight / 1.8
    }

    // run test //

    async function fetchTestResults(solution, test, lang) {
        const res = await fetch(`http://localhost:9000/test/${lang}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                solution: solution1,
                test: test1
            })
        })
        const data = await res.json()
        if (res.ok) {
            return data
        } else {
            throw new Error(data)
        }
    }

    function runTest1HandleClick() {
        showTest1Result = true
        promiseTest1Result = fetchTestResults(solution1, test1, languageName1)
    }

    function runTest2HandleClick() {
        showTest2Result = true
        promiseTest2Result = fetchTestResults()
    }

    // initial loading //

    async function getInitValues() {
        const res = await fetch(`http://localhost:9000/init-data/${taskId}`)
        const data = await res.json()
        if (res.ok) {
            return data
        } else {
            throw new Error(data)
        }
    }

    // call on start //

    onMount(() => {
        window.addEventListener('resize', resizeBoxSize);
    });

    resizeBoxSize()

</script>

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
        <label for="language-picker-select"><b>First language:</b></label>
        <select name="language-picker-select" id="language-picker-select" bind:value={languageName1}
                on:change={changeLanguage1}>
            {#each res.languages as lang}
                <option value={lang}>{lang}</option>
            {/each}
        </select>

        &nbsp;
        {#if showSolutionsAndTestsSelector}
            {#await solutionsAndTasks}
                <p>Loading Solutions...</p>
            {:then res}
                <label for="solution-picker-select"><b>Select from solutions:</b></label>
                <select name="solution-picker-select" id="solution-picker-select" bind:value={solutionSelector1}
                        on:change={setSolution1}>
                    {#each Object.entries(res.solutions) as [id, info]}
                        <option value={id}>{info.date}</option>
                    {/each}
                </select>

                &nbsp;
                <span class="reset-text" on:click={resetSolution1}>click to reset solution</span>
                &nbsp;

                <label for="test-picker-select"><b>Select from test:</b></label>
                <select name="test-picker-select" id="test-picker-select" bind:value={testSelector1}
                        on:change={setTest1}>
                    {#each Object.entries(res.tests) as [id, info]}
                        <option value={id}>{info.date}</option>
                    {/each}
                </select>

                &nbsp;
                <span class="reset-text" on:click={resetTest1}>click to reset test</span>
            {:catch error}
                <p style="color: red">{error.message}</p>
            {/await}
        {/if}

        <br>

        <label for="language2-picker-select"><b>Second language:</b></label>
        <select name="language2-picker-select" id="language2-picker-select" bind:value={languageName2}
                on:change={changeLanguage2}>
            {#each res.languages as lang}
                <option value={lang}>{lang}</option>
            {/each}
        </select>
    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}
</div>

<!-- editor boxes -->

{#await initValues}
    <p>Loading description...</p>
{:then res}
    <div class="box">
        <p><b>description</b></p>
        <textarea style="width: {boxWidth}px; height: {boxHeight}px">{res.text}</textarea>
    </div>
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}

{#if showSolution1}
    <div class="box">
        <p><b>solution</b>&nbsp;<span class="remove-text"
                                      on:click={() => {showSolution1 = false;numberOfBoxes--;resizeBoxSize()}}>click to remove</span>
        </p>
        <textarea bind:value={solution1}
                  style="width: {boxWidth}px; height: {boxHeight}px"></textarea>
    </div>
{/if}

{#if showTest1}
    <div class="box">
        <p><b>test</b>&nbsp;<span class="remove-text"
                                  on:click={() => {showTest1 = false;numberOfBoxes--;resizeBoxSize()}}>click to remove</span>
        </p>
        <textarea bind:value={test1}
                  style="width: {boxWidth}px; height: {boxHeight}px"></textarea>
    </div>
{/if}

<!-- test results 1 -->

<br>

<div id="test-result-1">
    <button type="button" on:click={runTest1HandleClick}>
        Test
    </button>

    <br>

    {#if showTest1Result}
        {#await promiseTest1Result}
            <p>loading...</p>
        {:then res}
            {#if res.exit_code === 1}
                <p><b>couldn't compile</b></p>
                <textarea readonly rows="25" cols="50">{res.out.replaceAll('^', '\n')}</textarea>
            {:else}
                {#if res.exit_code === 2}
                    <p><b>test failed</b></p>
                    <textarea readonly rows="25" cols="50">{res.out.replaceAll('^', '\n')}</textarea>
                {:else}
                    <p><b>test OK</b></p>
                    <p>compilation time: {res.compilation_time} s</p>
                    <p>real time: {res.real_time} s</p>
                    <p>kernel time: {res.kernel_time} s</p>
                    <p>user time: {res.user_time} s</p>
                    <p>max ram usage: {res.max_ram_usage} mb</p>
                    <p>binary size: {res.binary_size} mb</p>
                    <p>test output:</p>
                    <div class="test-output">{res.out.replaceAll('^', '\n')}</div>
                {/if}
            {/if}
        {:catch error}
            <p style="color: red">{error.message}</p>
        {/await}
    {/if}
</div>

<!-- test results 2 -->

<div id="test-result-2">
    <button type="button" on:click={runTest2HandleClick}>
        Test
    </button>

    <br>

    {#if showTest2Result}
        {#await promiseTest2Result}
            <p>loading...</p>
        {:then res}
            {#if res.exit_code === 1}
                <p><b>couldn't compile</b></p>
                <textarea readonly rows="25" cols="50">{res.out.replaceAll('^', '\n')}</textarea>
            {:else}
                {#if res.exit_code === 2}
                    <p><b>test failed</b></p>
                    <textarea readonly rows="25" cols="50">{res.out.replaceAll('^', '\n')}</textarea>
                {:else}
                    <p><b>test OK</b></p>
                    <p>compilation time: {res.compilation_time} s</p>
                    <p>real time: {res.real_time} s</p>
                    <p>kernel time: {res.kernel_time} s</p>
                    <p>user time: {res.user_time} s</p>
                    <p>max ram usage: {res.max_ram_usage} mb</p>
                    <p>binary size: {res.binary_size} mb</p>
                    <p>test output:</p>
                    <p>{res.out.replaceAll('^', '\n')}</p>
                {/if}
            {/if}
        {:catch error}
            <p style="color: red">{error.message}</p>
        {/await}
    {/if}
</div>

<!-- styles -->

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
        resize: none;
        /*resize: vertical;*/
        /*resize: horizontal;*/
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
        color: darkcyan;
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
</style>

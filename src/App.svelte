<script>
    import {onMount} from 'svelte';

    // -- some consts

    const id = new URLSearchParams(window.location.search).get('id')

    // -- initial loading --
    async function getInitValues() {
        const res = await fetch(`http://localhost:9000/task/${id}/init`, {
            method: 'GET',
        })
        const data = await res.json()
        if (res.ok) {
            return data
        } else {
            throw new Error(data)
        }
    }

    let initValues = getInitValues()

    // -- change language --

    let language = ""
    let language2 = ""

    function changeLanguage() {
        // do something
    }

    function changeLanguage2() {
        // do something
    }

    // -- editor core --

    let test = ""
    let solution = ""
    let numberOfBoxes = 3
    let boxWidth = 0
    let boxHeight = 0
    let setBoxSize = function () {
        boxWidth = window.innerWidth / numberOfBoxes - 30
        boxHeight = window.innerHeight / 1.8
    }
    setBoxSize()

    // -- run test --

    let showTestResult = false
    let promiseTestResult = Promise.resolve([]);

    async function doTest() {
        const res = await fetch('http://localhost:4000/go', {
            method: 'POST',
            body: JSON.stringify({
                'solution': solution,
                'test': test
            })

        })
        const data = await res.json()
        if (res.ok) {
            return data
        } else {
            throw new Error(data)
        }
    }

    function runTestHandleClick() {
        showTestResult = true
        promiseTestResult = doTest()
    }

    onMount(() => {
        window.addEventListener('resize', setBoxSize);
    });

</script>
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

<div class="selector">
    {#await initValues}
        <p>Loading languages...</p>
    {:then res}
        <label for="language-picker-select"><b>Select language:</b></label>
        <select name="language-picker-select" id="language-picker-select" bind:value={language}
                on:change={changeLanguage}>
            {#each res.languages as lang}
                <option value={lang}>{lang}</option>
            {/each}
        </select>

        <br>

        <label for="language2-picker-select"><b>Select second language:</b></label>
        <select name="language2-picker-select" id="language2-picker-select" bind:value={language2}
                on:change={changeLanguage2}>
            {#each res.languages as lang}
                <option value={lang}>{lang}</option>
            {/each}
        </select>
    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}
</div>

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

<div class="box">
    <p><b>test</b></p>
    <textarea bind:value={test}
              style="width: {boxWidth}px; height: {boxHeight}px"></textarea>
</div>

<div class="box">
    <p><b>solution</b></p>
    <textarea bind:value={solution}
              style="width: {boxWidth}px; height: {boxHeight}px"></textarea>
</div>

<br>

<button type="button" on:click={runTestHandleClick}>
    Test
</button>

<br>

{#if showTestResult}
    {#await promiseTestResult}
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
                <textarea readonly rows="25" cols="50">{res.out.replaceAll('^', '\n')}</textarea>
            {/if}
        {/if}
    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}
{/if}


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
        /*height: 100px;*/
        /*width: 400px;*/
        resize: none;
    }
</style>

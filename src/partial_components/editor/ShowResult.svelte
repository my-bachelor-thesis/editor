<script>
    import {AccordionItem} from 'sveltestrap'
    import DetailsFromRunErr from "./show_result_partial/DetailsFromRunErr.svelte"
    import TestOutput from "./show_result_partial/TestOutput.svelte"

    export let showTestResult, promiseResult
</script>

<!--TODO: what if timeout-->

{#if showTestResult}
    {#await promiseResult}
        <p>loading...</p>
    {:then res}
        {#if res.solution.exit_code === 1}
            <DetailsFromRunErr msg="couldn't compile"></DetailsFromRunErr>
            <TestOutput output={res.solution.output}></TestOutput>
        {:else}
            {#if res.solution.exit_code === 2}
                <DetailsFromRunErr msg="test failed"></DetailsFromRunErr>
                <TestOutput output={res.solution.output}></TestOutput>
            {:else}
                <AccordionItem header="Details from the run">
                    <p class="success-msg"><b>test OK</b></p>
                    <p>compilation time: {res.solution.compilation_time} s</p>
                    <p>real time: {res.solution.real_time} s</p>
                    <p>kernel time: {res.solution.kernel_time} s</p>
                    <p>user time: {res.solution.user_time} s</p>
                    <p>max ram usage: {res.solution.max_ram_usage} mb</p>
                    <p>binary size: {res.solution.binary_size} mb</p>
                </AccordionItem>
                <TestOutput output={res.solution.output} active></TestOutput>
            {/if}
        {/if}
    {:catch error}
        <p class="error">{error.message}</p>
    {/await}
{/if}

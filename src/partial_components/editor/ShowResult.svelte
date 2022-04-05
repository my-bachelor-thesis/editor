<script>
    export let showTestResult, promiseResult
</script>


{#if showTestResult}
    {#await promiseResult}
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
        <p class="error">{error.message}</p>
    {/await}
{/if}

<style>
    .test-output {
        white-space: pre-wrap;
        border-style: solid;
        border-width: thin;
    }
</style>

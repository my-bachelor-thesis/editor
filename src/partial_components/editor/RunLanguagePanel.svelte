<script>
import ShowResult from "./ShowResult.svelte"

export let languageName, runTestHandleClick, infoBoxContent, showTestResult, promiseTestResult, languageNumber


</script>

{#if languageName}
    <div id="test-result-{languageNumber}">
        <button type="button" on:click={runTestHandleClick}>
            Run {languageNumber}. language
        </button>

        <br><br>
        <!-- info box -->
        <div class="info-box">
            {#each infoBoxContent as line}
                {line}<br>
            {/each}
        </div>
        <br>

        <ShowResult showTestResult={showTestResult} promiseResult={promiseTestResult}/>
    </div>
{/if}

<style>
    :global(#test-result-1) {
        float: left;
        width: 50%;
    }

    :global(#test-result-2) {
        float: right;
        width: 45%;
    }
</style>

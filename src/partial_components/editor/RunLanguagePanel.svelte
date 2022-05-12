<script>
    import * as helpers from "../../helpers"
    import md5 from 'blueimp-md5';
    import {Accordion, AccordionItem} from 'sveltestrap';
    import TestOutput from "./show_result_partial/TestOutput.svelte";
    import DetailsFromRunErr from "./show_result_partial/DetailsFromRunErr.svelte";
    import ErrorMessage from "../messages/ErrorMessage.svelte";

    export let language, url, taskId, selectedSolutionStore, selectedTestStore, showTestResult

    let postError

    function paringFunction(solutionHash, testHash) {
        return solutionHash + "," + testHash
    }

    async function fetchTestResults(solution, test, urlParam, hashId) {
        let body = JSON.stringify({
            solution: solution,
            test: test,
            task_id: parseInt(taskId),
            hash_id: hashId
        })
        return helpers.postJson(`${url}/${urlParam}/${language.name}`, body)
    }

    function insertNewSolutionIntoSelector(solutionHash, data) {
        language.cache.solutionFromLastRun = solutionHash
        let solution = new Map([[data.solution.id, data.solution]])
        let transformedSolution = helpers.transformSolutionsForSelect(solution)[0]
        selectedSolutionStore.value.set(transformedSolution)
        language.solutionsAndTestsSelector.solutions.push(transformedSolution)
    }

    function insertNewTestIntoSelector(testHash, data) {
        language.cache.testFromLastRun = testHash
        let test = new Map([[data.test_id, {
            name: "",
            last_modified: data.test_last_modified,
            final: false,
            public: false
        }]])
        let transformedTest = helpers.transformTestsForSelect(test)[0]
        selectedTestStore.value.set(transformedTest)
        language.solutionsAndTestsSelector.tests.push(transformedTest)
    }

    function runTest() {
        language.infoBoxContent = []

        let solutionInEditor = language.editors.solution.state.doc.toString()
        let solutionInEditorHash = md5(solutionInEditor)
        let testInEditor = language.editors.test.state.doc.toString()
        let testInEditorHash = md5(testInEditor)

        let hashId = paringFunction(solutionInEditorHash, testInEditorHash)

        console.log("ifing", language.cache.solutionFromLastRun === solutionInEditorHash, language.cache.testFromLastRun === testInEditorHash)

        if (language.cache.solutionFromLastRun === solutionInEditorHash && language.cache.testFromLastRun === testInEditorHash) {
            if (!showTestResult) {
                language.infoBoxContent = ["running, nothing to save"]
                language.testResult.promise = fetchTestResults(solutionInEditor, testInEditor, "test", hashId)
                language.cache.solutionFromLastRun = solutionInEditorHash
                language.cache.testFromLastRun = testInEditorHash
            } else {
                language.infoBoxContent = ["nothing changed, not running"]
            }
        } else if (language.cache.solutionFromLastRun !== solutionInEditorHash && language.cache.testFromLastRun !== testInEditorHash) {
            language.infoBoxContent = ["saving solution, test and running"]

            language.dontHideTestResultWhileInsertingSolution = true
            language.dontHideTestResultWhileInsertingTest = true

            language.testResult.promise = fetchTestResults(solutionInEditor, testInEditor, "test-and-save-both", hashId)
            language.testResult.promise.then(data => {
                insertNewSolutionIntoSelector(solutionInEditorHash, data)
                insertNewTestIntoSelector(testInEditorHash, data)
            })
        } else if (language.cache.solutionFromLastRun !== solutionInEditorHash && language.cache.testFromLastRun === testInEditorHash) {
            language.infoBoxContent = ["saving solution and running"]

            language.dontHideTestResultWhileInsertingSolution = true

            language.testResult.promise = fetchTestResults(solutionInEditor, testInEditor, "test-and-save-solution", hashId)
            language.testResult.promise.then(data => {
                insertNewSolutionIntoSelector(solutionInEditorHash, data)
            })
        } else {
            language.infoBoxContent = ["saving test and running"]

            language.dontHideTestResultWhileInsertingTest = true

            language.testResult.promise = fetchTestResults(solutionInEditor, testInEditor, "test-and-save-test", hashId)
            language.testResult.promise.then(data => {
                insertNewTestIntoSelector(testInEditorHash, data)
            })
        }
        showTestResult = true

    }
</script>

<ErrorMessage msg={postError}/>

{#if language.name}
    <div id="test-result-{language.number}">
        <button type="button" on:click={runTest}>
            Run {language.number}. language
        </button>

        <br><br>

        {#if showTestResult}
            <Accordion stayOpen>
                <AccordionItem header="Status">
                    <div>
                        {#each language.infoBoxContent as line}
                            {line}<br>
                        {/each}
                    </div>
                </AccordionItem>

                <!--TODO: what if timeout-->

                {#await language.testResult.promise}
                    <p>loading...</p>
                {:then res}
                    {#if res.solution.exit_code === 1}
                        <DetailsFromRunErr msg="couldn't compile"></DetailsFromRunErr>
                        <TestOutput output={res.solution.output} failed={true}/>
                    {:else}
                        {#if res.solution.exit_code === 2}
                            <DetailsFromRunErr msg="test failed"></DetailsFromRunErr>
                            <TestOutput output={res.solution.output} failed={true}/>
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
                            <TestOutput output={res.solution.output} failed={false}/>
                        {/if}
                    {/if}
                {:catch error}
                    <p class="error">{error.message}</p>
                {/await}
            </Accordion>
        {/if}
    </div>
{/if}

<style>
    :global(#test-result-1) {
        float: left;
        width: 50%;
    }

    :global(#test-result-2) {
        float: right;
        width: 50%;
    }
</style>

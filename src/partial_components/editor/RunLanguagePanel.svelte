<script>
    import * as helpers from "../../helpers"
    import md5 from 'blueimp-md5';
    import {Accordion, AccordionItem} from 'sveltestrap';
    import TestOutput from "./show_result_partial/TestOutput.svelte";
    import DetailsFromRunErr from "./show_result_partial/DetailsFromRunErr.svelte";
    import ErrorMessage from "../messages/ErrorMessage.svelte";
    import {get} from "svelte/store";
    import HelpMessage from "../messages/HelpMessage.svelte";

    export let language, url, taskId, selectedSolutionStore, selectedTestStore, showTestResult, updateTestId

    let postError

    function paringFunction(solutionHash, testHash) {
        return solutionHash + "," + testHash
    }

    async function fetchTestResults(solution, test, urlParam, hashId) {
        let body = JSON.stringify({
            solution: solution,
            solution_id: get(selectedSolutionStore) ? get(selectedSolutionStore).value : 0,
            test: test,
            test_id: get(selectedTestStore).value,
            task_id: parseInt(taskId),
            hash_id: hashId
        })
        return helpers.postJson(`${url}/editor/${urlParam}/${language.name}`, body)
    }

    function insertNewSolutionIntoSelector(solutionHash, data, test_id) {
        language.cache.solutionFromLastRun = solutionHash
        let solution = [{
            id: data.inserted_solution.id,
            name: "",
            last_modified: data.inserted_solution.last_modified,
            is_public: false,
            test_id: test_id
        }]
        let transformedSolution = helpers.transformSolutionsForSelect(solution)[0]
        selectedSolutionStore.value.set(transformedSolution)
        language.solutionsAndTestsSelector.solutions.unshift(transformedSolution)
    }

    function insertNewTestIntoSelector(testHash, data) {
        language.cache.testFromLastRun = testHash
        let test = [{
            id: data.inserted_test.id,
            name: "",
            last_modified: data.inserted_test.last_modified,
            final: false,
            public: false
        }]
        let transformedTest = helpers.transformTestsForSelect(test)[0]
        selectedTestStore.value.set(transformedTest)
        language.solutionsAndTestsSelector.tests.unshift(transformedTest)
    }

    const nothingChangedNotRunning = "nothing changed, not running"

    function runSolution() {
        language.infoBoxContent = []
        postError = ""

        let solutionInEditor = language.editors.solution.state.doc.toString()
        let solutionInEditorHash = md5(solutionInEditor)
        let testInEditor = language.editors.test.state.doc.toString()
        let testInEditorHash = md5(testInEditor)

        if (!solutionInEditor) {
            postError = "Solution is empty"
            return
        } else if (!testInEditor) {
            postError = "Test is empty"
            return
        }

        let hashId = paringFunction(md5(solutionInEditor.replace(/\s\s+/g, ' ')), md5(testInEditor.replace(/\s\s+/g, ' ')))

        if (language.cache.solutionFromLastRun === solutionInEditorHash && language.cache.testFromLastRun === testInEditorHash) {
            if (!showTestResult) {
                showTestResult = true
                language.infoBoxContent = ["running, nothing to save"]
                language.testResult.promise = fetchTestResults(solutionInEditor, testInEditor, "test", hashId)
                language.cache.solutionFromLastRun = solutionInEditorHash
                language.cache.testFromLastRun = testInEditorHash
            } else {
                language.infoBoxContent = [nothingChangedNotRunning]
            }
            return
        }

        showTestResult = true;

        (async () => {
            if (language.cache.solutionFromLastRun !== solutionInEditorHash && language.cache.testFromLastRun !== testInEditorHash) {
                language.infoBoxContent = ["saving solution, test and running"]

                language.dontHideTestResultWhileInsertingSolution = true
                language.dontHideTestResultWhileInsertingTest = true

                language.testResult.promise = fetchTestResults(solutionInEditor, testInEditor, "test-and-save-both", hashId)
                let data = await language.testResult.promise
                insertNewSolutionIntoSelector(solutionInEditorHash, data, data.inserted_test.id)
                insertNewTestIntoSelector(testInEditorHash, data)
            } else if (language.cache.solutionFromLastRun !== solutionInEditorHash && language.cache.testFromLastRun === testInEditorHash) {
                language.infoBoxContent = ["saving solution and running"]

                language.dontHideTestResultWhileInsertingSolution = true

                language.testResult.promise = fetchTestResults(solutionInEditor, testInEditor, "test-and-save-solution", hashId)
                let data = await language.testResult.promise
                insertNewSolutionIntoSelector(solutionInEditorHash, data, get(selectedTestStore).value)
            } else {
                language.infoBoxContent = ["saving test and running"]

                language.dontHideTestResultWhileInsertingTest = true

                language.testResult.promise = fetchTestResults(solutionInEditor, testInEditor, "test-and-save-test", hashId)
                let data = await language.testResult.promise
                insertNewTestIntoSelector(testInEditorHash, data)
            }

            updateTestId(get(selectedSolutionStore).value, get(selectedTestStore).value)
        })()
    }

    $: didntRun = language.infoBoxContent.length > 0 && language.infoBoxContent[0] === nothingChangedNotRunning
</script>

<ErrorMessage msg={postError}/>

{#if language.name}
    <div id="test-result-{language.number}">
        <button type="button" on:click={runSolution}>
            Run {language.number}. language
        </button>
        <HelpMessage imageWidthPercentage="140" text="Run solution and test"/>

        <br><br>

        {#if showTestResult}
            <Accordion stayOpen>
                <AccordionItem header="Saving status" active={didntRun}>
                    <div>
                        {#if language.infoBoxContent.length > 0}
                            {#each language.infoBoxContent as line}
                                {line}<br>
                            {/each}
                        {:else}
                            None
                        {/if}
                    </div>
                </AccordionItem>

                {#await language.testResult.promise}
                    <p>loading...</p>
                {:then res}
                    {#if res.result.exit_code === 1}
                        <DetailsFromRunErr msg="couldn't compile"></DetailsFromRunErr>
                        <TestOutput output={res.result.output} failed={true}/>
                    {:else}
                        {#if res.result.exit_code === 2}
                            <DetailsFromRunErr msg="test failed"></DetailsFromRunErr>
                            <TestOutput output={res.result.output} failed={true}/>
                        {:else}
                            <AccordionItem header="Details from the run" active>
                                <p class="success-msg"><b>test OK</b></p>
                                <p>compilation time: {res.result.compilation_time} s</p>
                                <p>real time: {res.result.real_time} s</p>
                                <p>kernel time: {res.result.kernel_time} s</p>
                                <p>user time: {res.result.user_time} s</p>
                                <p>max ram usage: {res.result.max_ram_usage} mb</p>
                                <p>binary size: {res.result.binary_size} mb</p>
                            </AccordionItem>
                            <TestOutput output={res.result.output} failed={false}/>
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

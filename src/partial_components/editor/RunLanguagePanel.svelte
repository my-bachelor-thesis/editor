<script>
    import ShowResult from "./ShowResult.svelte"
    import * as helpers from "../../helpers"
    import md5 from 'blueimp-md5';
    import {get} from "svelte/store";

    // TODO: use paringFunction
    export let language, url, taskId, paringFunction, selectedSolutionStore, selectedTestStore

    async function fetchTestResults(solution, test, urlParam) {
        let body = JSON.stringify({
            solution: solution,
            solution_id: parseInt(get(selectedSolutionStore.value).value),
            test: test,
            test_id: parseInt(get(selectedTestStore.value).value),
            task_id: parseInt(taskId)
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

        language.testResult.show = true

        if (language.cache.solutionFromLastRun === null || language.cache.testFromLastRun === null) {
            language.infoBoxContent.push("running")
            language.testResult.promise = fetchTestResults(solutionInEditor, testInEditor, "test")
            language.cache.solutionFromLastRun = solutionInEditorHash
            language.cache.testFromLastRun = testInEditorHash
        } else if (language.cache.solutionFromLastRun === solutionInEditorHash && language.cache.testFromLastRun === testInEditorHash) {
            language.infoBoxContent.push("nothing changed, not running")
        } else if (language.cache.solutionFromLastRun !== solutionInEditorHash && language.cache.testFromLastRun !== testInEditorHash) {
            language.infoBoxContent.push("saving solution, test and running")

            language.testResult.promise = fetchTestResults(solutionInEditor, testInEditor, "test-and-save-both")

            language.testResult.promise.then(data => {
                insertNewSolutionIntoSelector(solutionInEditorHash, data)
                insertNewTestIntoSelector(testInEditorHash, data)
            })
        } else if (language.cache.solutionFromLastRun !== solutionInEditorHash && language.cache.testFromLastRun === testInEditorHash) {
            language.infoBoxContent.push("saving solution and running")

            language.testResult.promise = fetchTestResults(solutionInEditor, testInEditor, "test-and-save-solution")

            language.testResult.promise.then(data => {
                insertNewSolutionIntoSelector(solutionInEditorHash, data)
            })
        } else {
            language.infoBoxContent.push("saving test and running")
            language.testResult.promise = fetchTestResults(solutionInEditor, testInEditor, "test-and-save-test")
            language.testResult.promise.then(data => {
                insertNewTestIntoSelector(testInEditorHash, data)
            })
        }
    }
</script>

{#if language.name}
    <div id="test-result-{language.number}">
        <button type="button" on:click={runTest}>
            Run {language.number}. language
        </button>

        <br><br>
        <!-- info box -->
        <div class="info-box">
            {#each language.infoBoxContent as line}
                {line}<br>
            {/each}
        </div>
        <br>

        <ShowResult showTestResult={language.testResult.show}
                    promiseResult={language.testResult.promise}/>
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

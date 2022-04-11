<script>
    import ShowResult from "./ShowResult.svelte"
    import {tick} from "svelte";

    export let language, url, taskId, testResultsCache, paringFunction

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

    function runTest() {
        language.infoBoxContent = []

        let solutionInEditor = language.editors.solution.state.doc.toString()
        let testInEditor = language.editors.test.state.doc.toString()

        if (language.testResult.show && language.cache.solutionFromLastRun === solutionInEditor && testInEditor === language.cache.testFromLastRun) {
            language.infoBoxContent.push("nothing changed, not running")
            return
        }

        if (language.cache.solutionFromLastRun !== solutionInEditor && testInEditor !== language.cache.testFromLastRun) {
            language.infoBoxContent.push("saving solution, test and running")
            language.testResult.promise = fetchTestResults(solutionInEditor, language.solutionsAndTestsSelector.selectedSolution, testInEditor, language.solutionsAndTestsSelector.selectedTest, language.name, "test-and-save-solution")
            language.testResult.promise.then(async (data) => {
                language.cache.solutionFromLastRun = solutionInEditor
                language.solutionsAndTestsSelector.selectedSolution = data.solution.id
                language.cache.solutions[data.solution.id] = {
                    'date': data.solution.last_modified,
                    'exit_code': data.solution.exit_code
                }
                await tick()
                document.getElementById("solution1-picker-select").value = data.solution.id

                language.cache.testFromLastRun = testInEditor
                language.solutionsAndTestsSelector.selectedTest = data.test_id
                language.cache.tests[data.test_id] = {'date': data.test_last_modified, 'final': false}
                await tick()
                document.getElementById("test1-picker-select").value = data.test_id
            })

        } else if (language.cache.solutionFromLastRun !== solutionInEditor && testInEditor === language.cache.testFromLastRun) {
            language.infoBoxContent.push("saving solution and running")
            language.testResult.promise = fetchTestResults(solutionInEditor, language.solutionsAndTestsSelector.selectedSolution, testInEditor, language.solutionsAndTestsSelector.selectedTest, language.name, "test-and-save-both")
            language.testResult.promise.then(async (data) => {
                language.cache.solutionFromLastRun = solutionInEditor
                language.solutionsAndTestsSelector.selectedSolution = data.solution.id
                language.cache.solutions[data.solution.id] = {
                    'date': data.solution.last_modified,
                    'exit_code': data.solution.exit_code
                }
                await tick()
                document.getElementById("solution1-picker-select").value = data.solution.id
            })

        } else if (language.cache.solutionFromLastRun === solutionInEditor && testInEditor !== language.cache.testFromLastRun) {
            language.infoBoxContent.push("saving test and running")
            language.testResult.promise = fetchTestResults(solutionInEditor, language.solutionsAndTestsSelector.selectedSolution, testInEditor, language.solutionsAndTestsSelector.selectedTest, language.name, "test-and-save-test")
            language.testResult.promise.then(async (data) => {
                language.cache.testFromLastRun = testInEditor
                language.solutionsAndTestsSelector.selectedTest = data.test_id
                language.cache.tests[data.test_id] = {'date': data.test_last_modified, 'final': false}
                await tick()
                document.getElementById("test1-picker-select").value = data.test_id
            })

        } else {
            language.infoBoxContent.push("running")
            language.testResult.promise = fetchTestResults(solutionInEditor, language.solutionsAndTestsSelector.selectedSolution, testInEditor, language.solutionsAndTestsSelector.selectedTest, language.name, "test")
        }

        language.testResult.show = true
        language.testResult.promise.then((res) => {
            testResultsCache.set(paringFunction(language.solutionsAndTestsSelector.selectedSolution, language.solutionsAndTestsSelector.selectedTest), res)
        })
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

        <ShowResult showTestResult={language.testResult.show} promiseResult={language.testResult.promise}/>
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

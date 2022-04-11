<script>
    import {Button} from "sveltestrap";
    import {GridStyleStore} from "./gridstyle";
    import Split from "split-grid";
    import * as helpers from "../../helpers"
    import {tick} from "svelte";

    export let language, initValues, taskId, url

    function hideLanguage() {
        language.solutionsAndTestsSelector.show = false
        language.name = ""
        GridStyleStore.removeBoxes(2)
        language.showSolution = false
        language.solutionsAndTestsSelector.selectedSolution = 0
        language.showTest = false
        language.solutionsAndTestsSelector.selectedTest = 0
    }

    async function fetchSolutionsAndTasks(language) {
        return helpers.fetchJson(`${url}/solutions-tests/${taskId}/${language}`)
    }

    function changeLanguage() {
        language.infoBoxContent = []
        if (language.number === 1 && GridStyleStore.isEmpty()) {
            GridStyleStore.addBoxes(1)
        }
        if (!language.showSolution) {
            language.showSolution = true;
            GridStyleStore.addBoxes(1);
            (async () => {
                await tick()
                language.editors.solution = helpers.Editor.newEditor(language.name, document.getElementById(`solution${language.number}`))
            })()
        }
        if (!language.showTest) {
            language.showTest = true;
            GridStyleStore.addBoxes(1);
            (async () => {
                await tick()
                language.editors.test = helpers.Editor.newEditor(language.name, document.getElementById(`test${language.number}`))
            })()
        }
        (async () => {
            await tick()
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
        language.solutionsAndTestsSelector.show = true
        language.solutionsAndTestsSelector.promise = fetchSolutionsAndTasks(language.name)
        language.solutionsAndTestsSelector.promise.then((data) => {
            language.cache.solutions = data.solutions
            language.cache.tests = data.tests
        })
    }
</script>

<label for="language{language.number}-picker-select"><b>{language.number === 1 ? "First" : "Second"} language:</b></label>
<select name="language{language.number}-picker-select" id="language{language.number}-picker-select" bind:value={language.name}
        on:change={changeLanguage}>
    {#each initValues.languages as lang}
        <option value={lang}>{lang}</option>
    {/each}
</select>
&nbsp;
<Button color="secondary" class="btn-sm" on:click={() => hideLanguage(language.number)}>Deselect language</Button>
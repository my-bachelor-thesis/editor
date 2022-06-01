<script>
    import {GridStyleStore} from "./gridstyle";
    import Split from "split-grid";
    import * as helpers from "../../helpers"
    import {tick} from "svelte";
    import Select from "svelte-select";
    import {Col} from "sveltestrap";
    import HelpMessage from "../messages/HelpMessage.svelte";

    export let language, initValues, taskId, url, selectedSolutionStore, selectedTestStore, isSecondLanguageIsSelected,
        onSelectSolution, onSelectTest, updateLastOpened, lastOpened

    let selectedLanguage, lastOpenedSolutionId

    function hideLanguage() {
        if (language.number === 2) {
            isSecondLanguageIsSelected = false
        }
        language.solutionsAndTestsSelector.show = false
        language.name = ""
        GridStyleStore.removeBoxes(2)
        language.showSolution = false
        selectedSolutionStore.set(undefined)
        language.showTest = false
        selectedTestStore.set(undefined)
    }

    async function fetchSolutionsAndTasks(language) {
        return helpers.fetchJson(`${url}/solutions-tests/${taskId}/${language}`)
    }

    function idFromTrackNumber(n) {
        switch (n) {
            case 1:
                return ["solution1"]
            case 3:
                return ["solution1", "test1"]
            case 5:
                return ["test1", "solution2"]
            case 7:
                return ["solution2", "test2"]
            default:
                return []
        }
    }

    function changeLanguage(event) {
        language.name = event.detail.value

        if (language.number === 2) {
            isSecondLanguageIsSelected = true
        }

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
        let solutionTrackNumber = language.number === 1 ? 1 : 5;
        (async () => {
            await tick()
            Split({
                onDragStart: function (_, n) {
                    for (const id of idFromTrackNumber(n)) {
                        document.getElementById(id).style.display = "none"
                    }
                },
                onDragEnd: function (_, n) {
                    for (const id of idFromTrackNumber(n)) {
                        document.getElementById(id).style.display = "block"
                        let label = document.getElementById(`${id}-label`)
                        if (label.style.display === "none") {
                            label.style.display = "block"
                            GridStyleStore.boxes[GridStyleStore.idToIndex(id)] = GridStyleStore.boxLength
                        }
                    }
                },
                columnGutters: [{
                    track: solutionTrackNumber,
                    element: document.querySelector(`.gutter-col-${solutionTrackNumber}`),
                }, {
                    track: solutionTrackNumber + 2,
                    element: document.querySelector(`.gutter-col-${solutionTrackNumber + 2}`),
                }],
            })
        })()

        language.solutionsAndTestsSelector.show = true
        language.solutionsAndTestsSelector.promise = fetchSolutionsAndTasks(language.name)
        language.solutionsAndTestsSelector.promise.then((data) => {
            language.solutionsAndTestsSelector.solutions = helpers.transformSolutionsForSelect(data.solutions)
            language.solutionsAndTestsSelector.tests = helpers.transformTestsForSelect(data.tests)

            if (Object.keys(language.solutionsAndTestsSelector.tests).length > 0) {
                let firstTest = language.solutionsAndTestsSelector.tests[0]
                selectedTestStore.value.set(firstTest)
                onSelectTest(firstTest, language, selectedSolutionStore)
            }

            if (lastOpenedSolutionId) {
                let sol = language.solutionsAndTestsSelector.solutions.find(x => x.value === lastOpenedSolutionId)
                if (sol) {
                    selectedSolutionStore.value.set(sol)
                    onSelectSolution(sol, language, selectedTestStore, selectedSolutionStore, false)
                }
                // don't run again
                lastOpenedSolutionId = 0
            } else if (Object.keys(language.solutionsAndTestsSelector.solutions).length > 0) {
                let firstSolution = language.solutionsAndTestsSelector.solutions[0]
                selectedSolutionStore.value.set(firstSolution)
                onSelectSolution(firstSolution, language, selectedTestStore, selectedSolutionStore)
            }
        })
    }

    function transformLanguagesForSelector(languages) {
        let res = []
        for (const lang of languages) {
            res.push({value: lang, label: lang})
        }
        return res
    }

    lastOpened.then(data => {
        if (data === "not found") {
            // ignore
        }
        if (language.number === 1 && data.language_1) {
            lastOpenedSolutionId = data.user_solution_id_for_language_1
            selectedLanguage = {label: data.language_1, value: data.language_1}
        } else if (language.number === 2 && data.language_2) {
            lastOpenedSolutionId = data.user_solution_id_for_language_2
            selectedLanguage = {label: data.language_2, value: data.language_2}
        }
    })
</script>

<Col>
    <div style="max-width: {language.solutionsAndTestsSelector.show ? '100' : '20'}%">
        <label for="language{language.number}-picker-select"
               class="no-wrap"><b>{language.number === 1 ? "First" : "Second"}
            language:</b></label>

        <HelpMessage imageWidthPercentage="120"
                     text="Select a language for which you want to show available solutions and tests"/>

        <Select id="language{language.number}-picker-select"
                items={transformLanguagesForSelector(initValues.languages)}
                on:select={changeLanguage}
                bind:value={selectedLanguage}
                on:clear={() => {
                    hideLanguage(language.number)
                    updateLastOpened()
                }}
                isClearable={!(isSecondLanguageIsSelected && language.number === 1)}/>
    </div>
</Col>
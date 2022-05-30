<script>
    import * as helpers from "../../helpers"
    import {Button} from "sveltestrap";
    import HelpMessage from "../messages/HelpMessage.svelte";
    import {tick} from "svelte";

    export let savedTask, languageEditors, error

    // index and code arguments are not mandatory
    function insertCodeToEditor(type, index, code) {
        let editor

        if (type === "solution") {
            editor = languageEditors.solutions.get(index)
            if (!code) {
                code = languageEditors.solutionExample
            }
        } else {
            if (!index) {
                editor = languageEditors.finalTest
            } else {
                editor = languageEditors.tests.get(index)
            }
            if (!code) {
                code = languageEditors.testExample
            }
        }

        editor.dispatch({
            changes: {from: 0, to: editor.state.doc.length, insert: code}
        })
    }

    function addEditor(type) {
        const frozenId = languageEditors.idOfLastEditor

        let title = document.createElement("h5")
        title.style.paddingTop = "1%"
        title.style.marginRight = "1%"
        title.style.display = "inline-block"
        title.innerText = `Public ${type}`

        let hint = document.createElement("button")
        hint.style.display = "inline-block"
        hint.className = "btn btn-outline-secondary btn-sm"
        hint.style.marginLeft = "1%"
        hint.type = "button"
        if (type === "solution") {
            hint.innerText = "Insert example solution"
            hint.onclick = function () {
                insertCodeToEditor("solution", frozenId)
            }
        } else {
            hint.innerText = "Insert example test"
            hint.onclick = function () {
                insertCodeToEditor("test", frozenId)
            }
        }

        let solution = document.createElement("div")

        let removeButton = document.createElement("button")
        removeButton.type = "button"
        removeButton.innerText = `Remove ${type}`
        let input = document.createElement("input")
        input.setAttribute('placeholder', `${type} name (optional)`)
        input.id = `name-of-${languageEditors.languageName}-${type}-${frozenId}`

        let editorsDiv = document.getElementById(`${languageEditors.languageName}-editors`)
        editorsDiv.append(title, input, hint, solution, removeButton)

        let editor = helpers.Editor.newEditor(languageEditors.languageName, solution)
        if (type === "solution") {
            languageEditors.solutions.set(languageEditors.idOfLastEditor, editor)
        } else {
            languageEditors.tests.set(languageEditors.idOfLastEditor, editor)
        }

        removeButton.onclick = function () {
            title.remove()
            hint.remove()
            solution.remove()
            removeButton.remove()
            input.remove()
            if (type === "solution") {
                languageEditors.solutions.delete(frozenId)
            } else {
                languageEditors.tests.delete(frozenId)
            }
        }

        languageEditors.idOfLastEditor++
    }

    // insert saved task if available

    (async () => {
        await tick()

        if (savedTask) {
            let finalTest = savedTask.final_tests.filter(x => x.language === languageEditors.languageName)
            if (finalTest.length > 0) {
                insertCodeToEditor("test", undefined, finalTest[0].code)
            }
            let numberOfEditors = 1
            console.log(languageEditors, "le")
            if (savedTask.public_solutions) {
                let publicSolutions = savedTask.public_solutions.filter(x => x.language === languageEditors.languageName)
                for (let solution of publicSolutions) {
                    addEditor("solution")
                    await tick()
                    insertCodeToEditor("solution", numberOfEditors, solution.code)
                    if (solution.name) {
                        document.getElementById(`name-of-${languageEditors.languageName}-solution-${numberOfEditors}`).value = solution.name
                    }
                    numberOfEditors++
                }
            }
            if (savedTask.public_tests) {
                let publicTests = savedTask.public_tests.filter(x => x.language === languageEditors.languageName)
                for (let test of publicTests) {
                    addEditor("test")
                    await tick()
                    insertCodeToEditor("test", numberOfEditors, test.code)
                    if (test.name) {
                        document.getElementById(`name-of-${languageEditors.languageName}-test-${numberOfEditors}`).value = test.name
                    }
                    numberOfEditors++
                }
            }
        }
    })()
</script>


<br><br>
<h3>{helpers.languageName(languageEditors.languageName)} editors</h3>
<br>
<div>
    <h5 style="display:inline-block;">Final test</h5>
    <HelpMessage imageWidthPercentage="120" style="display:inline-block;" text="Users can participate in the task statistics if they solve the final test.
        You have to write it for every selected language."/>
    <Button style="display:inline-block;" outline size="sm" on:click={() => insertCodeToEditor("test")} type="button">
        Insert example test
    </Button>
</div>
{#if error}
    <div class="error">{error}</div>
{/if}
<div id="{languageEditors.languageName}-editors">
    <div id="{languageEditors.languageName}-editor-final-test"></div>
    <br>
    <button on:click={() => addEditor("solution")} type="button">Add public solution</button>
    <button on:click={() => addEditor("test")} type="button">Add public test</button>
    <HelpMessage imageWidthPercentage="140" text="Users can participate in the task statistics if they solve the final test.
        You have to write it for every selected language"/>
    <br>
</div>

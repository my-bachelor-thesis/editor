<script>
    import * as helpers from "../../helpers"
    import {GoEditors, PythonEditors} from "../../add_task"

    export let lang, error

    function addEditor(editorsClass, language, type) {
        const frozenId = editorsClass.idOfLastEditor

        let title = document.createElement("h5")
        title.style.paddingTop = "1%"
        title.innerHTML = `Public ${type}`
        let solution = document.createElement("div")
        let removeButton = document.createElement("button")
        removeButton.type = "button"
        removeButton.innerHTML = `Remove ${type}`
        let input = document.createElement("input")
        input.setAttribute('placeholder', `${type} name (optional)`)
        input.id = `name-of-${language}-${type}-${frozenId}`

        let editorsDiv = document.getElementById(`${language}-editors`)
        editorsDiv.append(title, input, solution, removeButton)

        let editor = helpers.Editor.newEditor(language, solution)
        if (type === "solution") {
            editorsClass.solutions.set(editorsClass.idOfLastEditor, editor)
        } else {
            editorsClass.tests.set(editorsClass.idOfLastEditor, editor)
        }

        removeButton.onclick = function () {
            title.remove()
            solution.remove()
            removeButton.remove()
            input.remove()
            if (type === "solution") {
                editorsClass.solutions.delete(frozenId)
            } else {
                editorsClass.tests.delete(frozenId)
            }
        }

        editorsClass.idOfLastEditor++
    }

    function addGoSolutionEditor() {
        addEditor(GoEditors, helpers.languages.Go, "solution")
    }

    function addGoTestEditor() {
        addEditor(GoEditors, helpers.languages.Go, "test")
    }

    function addPythonSolutionEditor() {
        addEditor(PythonEditors, helpers.languages.Python, "solution")
    }

    function addPythonTestEditor() {
        addEditor(PythonEditors, helpers.languages.Python, "test")
    }

    let addSolutionFunc, addTestFunc
    switch (lang) {
        case helpers.languages.Go:
            addSolutionFunc = addGoSolutionEditor
            addTestFunc = addGoTestEditor
            break
        case helpers.languages.Python:
            addSolutionFunc = addPythonSolutionEditor
            addTestFunc = addPythonTestEditor
    }
</script>


<br><br>
<h3>{helpers.languageName(lang)} editors</h3>
<br>
<h5>Final test</h5>
{#if error}
    <div class="error">{error}</div>
{/if}
<div id="{lang}-editors">
    <div id="{lang}-editor-final-test"></div>
    <br>
    <button on:click={addSolutionFunc} type="button">Add public solution</button>
    <button on:click={addTestFunc} type="button">Add public test</button>
</div>

<style lang="scss">
  @import "./src/styles/global.scss";
</style>
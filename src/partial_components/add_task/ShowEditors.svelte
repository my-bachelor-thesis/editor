<script>
    import * as helpers from "../../helpers"
    import {CppEditors, GoEditors, JavascriptEditors, PythonEditors} from "../../add_task"
    import {Button} from "sveltestrap";
    import * as codeExamples from "./codeExamples"
    import HelpMessage from "../messages/HelpMessage.svelte";
    import {tick} from "svelte";

    export let lang, error

    // index argument is not mandatory
    function insertExample(type, index) {
        let editor, code

        console.log(type, index, "aaaaaaa")

        switch (lang) {
            case "go":
                if (type === "solution") {
                    editor = GoEditors.solutions.get(index)
                    code = codeExamples.goSolutionExample
                } else {
                    if (!index) {
                        editor = GoEditors.finalTest
                    } else {
                        editor = GoEditors.tests.get(index)
                    }
                    code = codeExamples.goTestExample
                }
                break
            case "python":
                if (type === "solution") {
                    editor = PythonEditors.solutions.get(index)
                    code = codeExamples.pythonSolutionExample
                } else {
                    if (!index) {
                        editor = PythonEditors.finalTest
                    } else {
                        editor = PythonEditors.tests.get(index)
                    }
                    code = codeExamples.pythonTestExample
                }
                break
            case "javascript":
                if (type === "solution") {
                    editor = JavascriptEditors.solutions.get(index)
                    code = codeExamples.javascriptSolutionExample
                } else {
                    if (!index) {
                        editor = JavascriptEditors.finalTest
                    } else {
                        editor = JavascriptEditors.tests.get(index)
                    }
                    code = codeExamples.javascriptTestExample
                }
                break
            case "cpp":
                if (type === "solution") {
                    editor = CppEditors.solutions.get(index)
                    code = codeExamples.cppSolutionExample
                } else {
                    if (!index) {
                        editor = CppEditors.finalTest
                    } else {
                        editor = CppEditors.tests.get(index)
                    }
                    code = codeExamples.cppTestExample
                }
        }
        editor.dispatch({
            changes: {from: 0, to: editor.state.doc.length, insert: code}
        })
    }

    function addEditor(editorsClass, language, type) {
        const frozenId = editorsClass.idOfLastEditor

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
                insertExample("solution", frozenId)
            }
        } else {
            hint.innerText = "Insert example test"
            hint.onclick = function () {
                insertExample("test", frozenId)
            }
        }

        let solution = document.createElement("div")

        let removeButton = document.createElement("button")
        removeButton.type = "button"
        removeButton.innerText = `Remove ${type}`
        let input = document.createElement("input")
        input.setAttribute('placeholder', `${type} name (optional)`)
        input.id = `name-of-${language}-${type}-${frozenId}`

        let editorsDiv = document.getElementById(`${language}-editors`)
        editorsDiv.append(title, input, hint, solution, removeButton)

        let editor = helpers.Editor.newEditor(language, solution)
        if (type === "solution") {
            editorsClass.solutions.set(editorsClass.idOfLastEditor, editor)
        } else {
            editorsClass.tests.set(editorsClass.idOfLastEditor, editor)
        }

        removeButton.onclick = function () {
            title.remove()
            hint.remove()
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
        addEditor(GoEditors, "go", "solution")
    }

    function addGoTestEditor() {
        addEditor(GoEditors, "go", "test")
    }

    function addPythonSolutionEditor() {
        addEditor(PythonEditors, "python", "solution")
    }

    function addPythonTestEditor() {
        addEditor(PythonEditors, "python", "test")
    }

    function addJavascriptSolutionEditor() {
        addEditor(JavascriptEditors, "javascript", "solution")
    }

    function addJavascriptTestEditor() {
        addEditor(JavascriptEditors, "javascript", "test")
    }

    function addCppSolutionEditor() {
        addEditor(CppEditors, "cpp", "solution")
    }

    function addCppTestEditor() {
        addEditor(CppEditors, "cpp", "test")
    }

    let addSolutionFunc, addTestFunc
    switch (lang) {
        case "go":
            addSolutionFunc = addGoSolutionEditor
            addTestFunc = addGoTestEditor
            break
        case "python":
            addSolutionFunc = addPythonSolutionEditor
            addTestFunc = addPythonTestEditor
            break
        case "javascript":
            addSolutionFunc = addJavascriptSolutionEditor
            addTestFunc = addJavascriptTestEditor
            break
        case "cpp":
            addSolutionFunc = addCppSolutionEditor
            addTestFunc = addCppTestEditor
    }

    (async () => {
        await tick()
        insertExample("test")
        addEditor(GoEditors, "go", "solution")
        insertExample("solution", 1)
        document.getElementById("name-of-go-solution-1").value = "aaa"
    })()

    // $: if (GoEditors.finalTest) {
    //     console.log("final", GoEditors.finalTest)
    // }
</script>


<br><br>
<h3>{helpers.languageName(lang)} editors</h3>
<br>
<div>
    <h5 style="display:inline-block;">Final test</h5>
    <HelpMessage imageWidthPercentage="120" style="display:inline-block;" text="Users can participate in the task statistics if they solve the final test.
        You have to write it for every selected language."/>
    <Button style="display:inline-block;" outline size="sm" on:click={() => insertExample("test")} type="button">Insert
        example test
    </Button>
</div>
{#if error}
    <div class="error">{error}</div>
{/if}
<div id="{lang}-editors">
    <div id="{lang}-editor-final-test"></div>
    <br>
    <button on:click={addSolutionFunc} type="button">Add public solution</button>
    <button on:click={addTestFunc} type="button">Add public test</button>
    <HelpMessage imageWidthPercentage="140" text="Users can participate in the task statistics if they solve the final test.
        You have to write it for every selected language"/>
    <br>
</div>

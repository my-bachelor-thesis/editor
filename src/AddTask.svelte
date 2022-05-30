<script>
    import {quill} from 'svelte-quill'
    import {createForm} from "svelte-forms-lib"
    import Select from 'svelte-select'
    import * as helpers from "./helpers"
    import * as store from "./store"
    import {get} from "svelte/store"
    import {CppEditors, GoEditors, JavascriptEditors, PythonEditors} from "./partial_components/add_task/editors"
    import ShowEditors from "./partial_components/add_task/ShowEditors.svelte"
    import {EditorView} from "@codemirror/view";
    import ErrorMessage from "./partial_components/messages/ErrorMessage.svelte";
    import {onMount, tick} from "svelte";
    import {navigate} from "svelte-navigator";
    import HelpMessage from "./partial_components/messages/HelpMessage.svelte";

    export let savedTask

    // reset all
    for (let editor of [CppEditors, GoEditors, JavascriptEditors, PythonEditors]) {
        editor.reset()
    }

    // redirect if not logged in
    helpers.redirectIfNotLoggedIn()

    const languages = [
        {value: "go", label: 'Go'},
        {value: "python", label: 'Python'},
        {value: "javascript", label: 'Javascript'},
        {value: "cpp", label: 'C++'},
    ]
    let selectedLanguages = []

    let isGoEditors = false, isPythonEditors = false, isJavascriptEditors = false, isCppEditors = false

    let postError = ""

    function isQuillEmpty(editor) {
        return editor.html === "<p><br></p>" || editor.html === ""
    }

    //form stuff
    const {form, errors, state, handleChange, handleSubmit} = createForm({
        initialValues: {
            title: "",
            difficulty: "",
            description: "",
        },
        validate: values => {
            let errs = {}
            if (values.title === "") {
                errs["title"] = "title is required"
            } else if (values.title && values.title.length > 100) {
                errs["title"] = "title is too long"
            }
            if (values.difficulty === "") {
                errs["difficulty"] = "select difficulty"
            }
            if (isQuillEmpty(descriptionContent)) {
                errs["description"] = "description is required"
            }
            if (selectedLanguages === null || selectedLanguages.length === 0) {
                errs["languages"] = "select at least one language"
            }
            if (isGoEditors && GoEditors.finalTest.state.doc.toString() === "") {
                errs["go"] = "final test can't be empty"
            }
            if (isPythonEditors && PythonEditors.finalTest.state.doc.toString() === "") {
                errs["python"] = "final test can't be empty"
            }
            if (isJavascriptEditors && JavascriptEditors.finalTest.state.doc.toString() === "") {
                errs["javascript"] = "final test can't be empty"
            }
            if (isCppEditors && CppEditors.finalTest.state.doc.toString() === "") {
                errs["cpp"] = "final test can't be empty"
            }
            return errs
        },
        onSubmit: values => {
            values.description = descriptionContent.html

            let transformToList = function (language, type, arr) {
                let res = []
                for (const [id, editor] of arr) {
                    let editorContent = editor.state.doc.toString()
                    if (editorContent) {
                        let name = document.getElementById(`name-of-${language}-${type}-${id}`).value
                        res.push({name: name, code: editorContent, language: language})
                    }
                }
                return res
            }

            values.final_tests = []
            values.public_tests = []
            values.public_solutions = []

// TODO: move this to class
            if (isGoEditors) {
                values.final_tests.push({code: GoEditors.finalTest.state.doc.toString(), language: "go"})
                let solutions = transformToList("go", "solution", GoEditors.solutions)
                if (solutions.length > 0) {
                    values.public_solutions.push(...solutions)
                }
                let tests = transformToList("go", "test", GoEditors.tests)
                if (tests.length > 0) {
                    values.public_tests.push(...tests)
                }
            }
            if (isPythonEditors) {
                values.final_tests.push({code: PythonEditors.finalTest.state.doc.toString(), language: "python"})
                let solutions = transformToList("python", "solution", PythonEditors.solutions)
                if (solutions.length > 0) {
                    values.public_solutions.push(...solutions)
                }
                let tests = transformToList("python", "test", PythonEditors.tests)
                if (tests.length > 0) {
                    values.public_tests.push(...tests)
                }
            }
            if (isJavascriptEditors) {
                values.final_tests.push({
                    code: JavascriptEditors.finalTest.state.doc.toString(),
                    language: "javascript"
                })
                let solutions = transformToList("javascript", "solution", JavascriptEditors.solutions)
                if (solutions.length > 0) {
                    values.public_solutions.push(...solutions)
                }
                let tests = transformToList("javascript", "test", JavascriptEditors.tests)
                if (tests.length > 0) {
                    values.public_tests.push(...tests)
                }
            }
            if (isCppEditors) {
                values.final_tests.push({code: CppEditors.finalTest.state.doc.toString(), language: "cpp"})
                let solutions = transformToList("cpp", "solution", CppEditors.solutions)
                if (solutions.length > 0) {
                    values.public_solutions.push(...solutions)
                }
                let tests = transformToList("cpp", "test", CppEditors.tests)
                if (tests.length > 0) {
                    values.public_tests.push(...tests)
                }
            }

            postError = ""
            if (savedTask) {
                values.task_id = parseInt(new URLSearchParams(window.location.search).get("id"))
            }
            helpers.postJson(`${get(store.url)}/add-task/form`, JSON.stringify(values)).then(
                () => {
                    navigate("my-tasks?msg=Saved and ready to be published")
                }).catch(err => postError = err)
        }
    })

    // quill
    let quillOptions = {placeholder: "Write description here...",}
    let descriptionContent = {html: '', text: ''}

    $: if (descriptionContent.text) {
        if ($errors["description"] !== undefined && $errors["description"] !== "" && !isQuillEmpty(descriptionContent)) {
            $errors["description"] = ""
        }
    }

    // editors
    function showEditors(editorsClass) {
        switch (editorsClass.languageName) {
            case "go":
                isGoEditors = true
                break
            case "python":
                isPythonEditors = true
                break
            case "javascript":
                isJavascriptEditors = true
                break
            case "cpp":
                isCppEditors = true
        }

        (async () => {
            await tick()
            let updateExtension = EditorView.updateListener.of((v) => {
                if (v.docChanged) {
                    if ($errors[editorsClass.languageName] && editorsClass.finalTest.state.doc.toString() !== "") {
                        $errors[editorsClass.languageName] = ""
                    }
                }
            })
            let editor = helpers.Editor.newEditor(editorsClass.languageName,
                document.getElementById(`${editorsClass.languageName}-editor-final-test`), updateExtension)
            editorsClass.finalTest = editor
        })()
    }

    function handleLanguageSelect(event) {
        console.log(event.detail)
        selectedLanguages = event.detail
        if (selectedLanguages === null) {
            isGoEditors = false
            isPythonEditors = false
            isJavascriptEditors = false
            isCppEditors = false
            GoEditors.reset()
            PythonEditors.reset()
            JavascriptEditors.reset()
            CppEditors.reset()
        } else {
            selectedLanguages = selectedLanguages.map(x => x.value)
            if ($errors["languages"] && selectedLanguages.length !== 0) {
                $errors["languages"] = ""
            }
            if (selectedLanguages.includes("go")) {
                if (!isGoEditors) {
                    showEditors(GoEditors)
                }
            } else {
                isGoEditors = false
                GoEditors.reset()
            }
            if (selectedLanguages.includes("python")) {
                if (!isPythonEditors) {
                    showEditors(PythonEditors)
                }
            } else {
                isPythonEditors = false
                PythonEditors.reset()
            }
            if (selectedLanguages.includes("javascript")) {
                if (!isJavascriptEditors) {
                    showEditors(JavascriptEditors)
                }
            } else {
                isJavascriptEditors = false
                JavascriptEditors.reset()
            }
            if (selectedLanguages.includes("cpp")) {
                if (!isCppEditors) {
                    showEditors(CppEditors)
                }
            } else {
                isCppEditors = false
                CppEditors.reset()
            }
        }
    }

    let languagesInSelector

    onMount(() => {
        console.log(savedTask)
        if (savedTask) {
            $form.title = savedTask.title
            $form.difficulty = savedTask.difficulty

            const editorDiv = document.getElementById("editor")
            let pToReplace = editorDiv.querySelector(":scope p")
            let newPDiv = document.createElement("div")
            newPDiv.innerHTML = savedTask.description
            let newP = newPDiv.firstElementChild
            pToReplace.parentNode.replaceChild(newP, pToReplace)

            languagesInSelector = savedTask.final_tests.map(x => ({
                value: x.language,
                label: helpers.languageName(x.language)
            }))
        }
    })


</script>

<svelte:head>
    <link href="/css/quill.snow.css" rel="stylesheet">
</svelte:head>
<h1 class="small-margin">Add a task
    <HelpMessage imageWidthPercentage="200"
                 text="You can add your own task here. You have to choose at least one language in which the task can be solved.
                 You can read more about which testing libraries are used on the About page"/>
</h1>

<ErrorMessage msg={postError}/>

<div class="form">
    <form on:submit={handleSubmit}>

        <div style="margin-bottom: 1%">
            <h3>title</h3>
            <input bind:value={$form.title} on:change={handleChange} id="title" name="title" type="text"
                   placeholder="Title">
            {#if $errors.title}
                <div class="error">{$errors.title}</div>
            {/if}
        </div>

        <br>
        <h3>select difficulty</h3>
        <select id="difficulty" name="difficulty" bind:value={$form.difficulty} on:change={handleChange}>
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
        </select>
        {#if $errors.difficulty}
            <div class="error">{$errors.difficulty}</div>
        {/if}

        <br><br>
        <h3>description (first X characters will be used as a preview for the description)</h3>
        <div id="editor" use:quill={quillOptions} on:text-change={e => descriptionContent = e.detail}></div>
        {#if $errors.description}
            <div class="error">{$errors.description}</div>
        {/if}

        <br>
        <h3>Select languages</h3>

        <Select on:select={handleLanguageSelect} items={languages} isMulti={true} bind:value={languagesInSelector}/>
        {#if $errors.languages}
            <div class="error">{$errors.languages}</div>
        {/if}

        {#if isGoEditors}
            <ShowEditors savedTask={savedTask} languageEditors={GoEditors} error={$errors.go}/>
        {/if}

        {#if isPythonEditors}
            <ShowEditors savedTask={savedTask} languageEditors={PythonEditors} error={$errors.python}/>
        {/if}

        {#if isJavascriptEditors}
            <ShowEditors savedTask={savedTask} languageEditors={JavascriptEditors} error={$errors.javascript}/>
        {/if}

        {#if isCppEditors}
            <ShowEditors savedTask={savedTask} languageEditors={CppEditors} error={$errors.cpp}/>
        {/if}

        <br><br>
        <button>Save the task</button>
        <HelpMessage imageWidthPercentage="120" text="Saved task will appear on the 'Not published' page"/>
    </form>
</div>
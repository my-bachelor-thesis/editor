<script>
    import {quill} from 'svelte-quill'
    import {createForm} from "svelte-forms-lib"
    import Select from 'svelte-select'
    import * as helpers from "./helpers"
    import * as store from "./store"
    import {get} from "svelte/store"
    import {CppEditors, GoEditors, JavascriptEditors, PythonEditors} from "./add_task"
    import ShowEditors from "./partial_components/add_task/ShowEditors.svelte"
    import {EditorView} from "@codemirror/view";
    import ErrorMessage from "./partial_components/messages/ErrorMessage.svelte";
    import {tick} from "svelte";

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

            // TODO: toto prerob
            let transformToList = function (language, type, arr) {
                let res = []
                for (const [id, editor] of arr) {
                    let editorContent = editor.state.doc.toString()
                    if (editorContent) {
                        let name = document.getElementById(`name-of-${language}-${type}-${id}`).value
                        res.push({name: name, code: editorContent})
                    }
                }
                return res
            }

            if (isGoEditors) {
                values.go_final_test = GoEditors.finalTest.state.doc.toString()
                let solutions = transformToList("go", "solution", GoEditors.solutions)
                if (solutions.length > 0) {
                    values.go_solutions = solutions
                }
                let tests = transformToList("go", "test", GoEditors.tests)
                if (tests.length > 0) {
                    values.go_tests = tests
                }
            }
            if (isPythonEditors) {
                values.python_final_test = PythonEditors.finalTest.state.doc.toString()
                let solutions = transformToList("python", "solution", PythonEditors.solutions)
                if (solutions.length > 0) {
                    values.python_solutions = solutions
                }
                let tests = transformToList("python", "test", PythonEditors.tests)
                if (tests.length > 0) {
                    values.python_tests = tests
                }
            }
            postError = ""
            helpers.postJson(`${get(store.url)}/add-task/form`, JSON.stringify(values)).then(
                () => {
                    let msg = "the task was added"
                    if (!get(store.isAdmin)) {
                        msg = "the task was submitted for a review"
                    }
                    helpers.redirectToHomeWithMessage(msg)
                }).catch(err => postError = err)
        }
    })

    // quill
    let options = {placeholder: "Write description here...",}
    let descriptionContent = {html: '', text: ''}

    $: if (descriptionContent.text) {
        if ($errors["description"] !== undefined && $errors["description"] !== "" && !isQuillEmpty(descriptionContent)) {
            $errors["description"] = ""
        }
    }

    // editors
    function showEditors(editorsClass, language) {
        switch (language) {
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
                    if ($errors[language] && editorsClass.finalTest.state.doc.toString() !== "") {
                        $errors[language] = ""
                    }
                }
            })
            let editor = helpers.Editor.newEditor(language, document.getElementById(`${language}-editor-final-test`), updateExtension)
            editorsClass.finalTest = editor
        })()
    }

    function showGoEditors() {
        showEditors(GoEditors, "go")
    }

    function showPythonEditors() {
        showEditors(PythonEditors, "python")
    }

    function showJavascriptEditors() {
        showEditors(JavascriptEditors, "javascript")
    }

    function showCppEditors() {
        showEditors(CppEditors, "cpp")
    }

    function handleLanguageSelect(event) {
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
                    showGoEditors()
                }
            } else {
                isGoEditors = false
                GoEditors.reset()
            }
            if (selectedLanguages.includes("python")) {
                if (!isPythonEditors) {
                    showPythonEditors()
                }
            } else {
                isPythonEditors = false
                PythonEditors.reset()
            }
            if (selectedLanguages.includes("javascript")) {
                if (!isJavascriptEditors) {
                    showJavascriptEditors()
                }
            } else {
                isJavascriptEditors = false
                JavascriptEditors.reset()
            }
            if (selectedLanguages.includes("cpp")) {
                if (!isCppEditors) {
                    showCppEditors()
                }
            } else {
                isCppEditors = false
                CppEditors.reset()
            }
        }
    }
</script>

<svelte:head>
    <link href="/css/quill.snow.css" rel="stylesheet">
</svelte:head>

<h1 class="small-margin">Add a task</h1>

<ErrorMessage msg={postError}/>

<div class="form">
    <form on:submit={handleSubmit}>
        <h3>title</h3>
        <input bind:value={$form.title} on:change={handleChange} id="title" name="title" type="text"
               placeholder="Title">
        {#if $errors.title}
            <div class="error">{$errors.title}</div>
        {/if}

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
        <div class="editor" use:quill={options} on:text-change={e => descriptionContent = e.detail}></div>
        {#if $errors.description}
            <div class="error">{$errors.description}</div>
        {/if}

        <br>
        <h3>Select languages</h3>

        <Select on:select={handleLanguageSelect} items={languages} isMulti={true}/>
        {#if $errors.languages}
            <div class="error">{$errors.languages}</div>
        {/if}

        {#if isGoEditors}
            <ShowEditors lang="go" error={$errors.go}/>
        {/if}

        {#if isPythonEditors}
            <ShowEditors lang="python" error={$errors.python}/>
        {/if}

        {#if isJavascriptEditors}
            <ShowEditors lang="javascript" error={$errors.javascript}/>
        {/if}

        {#if isCppEditors}
            <ShowEditors lang="cpp" error={$errors.cpp}/>
        {/if}

        <br><br>
        <button>Submit</button>
    </form>
</div>

<!--<style>-->
<!--  :global(.cm-scroller) {-->
<!--    overflow: auto;-->
<!--    max-height: 400px !important;-->
<!--  }-->
<!--</style>-->
<script>
    import {quill} from 'svelte-quill'
    import {createForm} from "svelte-forms-lib"
    import Select from 'svelte-select'
    import * as helpers from "./helpers"
    import * as store from "./store"
    import {get} from "svelte/store"
    import {GoEditors, PythonEditors} from "./add_task"
    import ShowEditors from "./partial_components/add_task/ShowEditors.svelte"
    import {EditorView} from "@codemirror/view";
    import ErrorMessage from "./partial_components/messages/ErrorMessage.svelte";

    const languages = [
        {value: helpers.languages.Go, label: 'Go'},
        {value: helpers.languages.Python, label: 'Python'},
    ]
    let selectedLanguages = []

    let isGoEditors = false, isPythonEditors = false

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
                errs[helpers.languages.Go] = "final test can't be empty"
            }
            if (isPythonEditors && PythonEditors.finalTest.state.doc.toString() === "") {
                errs[helpers.languages.Python] = "final test can't be empty"
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
                        res.push({name: name, code: editorContent})
                    }
                }
                return res
            }

            if (isGoEditors) {
                values.go_final_test = GoEditors.finalTest.state.doc.toString()
                let solutions = transformToList(helpers.languages.Go, "solution", GoEditors.solutions)
                if (solutions.length > 0) {
                    values.go_solutions = solutions
                }
                let tests = transformToList(helpers.languages.Go, "test", GoEditors.tests)
                if (tests.length > 0) {
                    values.go_tests = tests
                }
            }
            if (isPythonEditors) {
                values.python_final_test = PythonEditors.finalTest.state.doc.toString()
                let solutions = transformToList(helpers.languages.Python, "solution", PythonEditors.solutions)
                if (solutions.length > 0) {
                    values.python_solutions = solutions
                }
                let tests = transformToList(helpers.languages.Python, "test", PythonEditors.tests)
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
                    console.log(msg)
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
            case helpers.languages.Go:
                isGoEditors = true
                break
            case helpers.languages.Python:
                isPythonEditors = true
        }
        const id = `${language}-editor-final-test`;
        (async () => {
            await helpers.waitForElementWithId(id)
            let updateExtension = EditorView.updateListener.of((v) => {
                if (v.docChanged) {
                    if ($errors[language] !== undefined && $errors[language] !== "" && editorsClass.finalTest.state.doc.toString() !== "") {
                        $errors[language] = ""
                    }
                }
            })
            let editor = helpers.Editor.newEditor(language, document.getElementById(id), updateExtension)
            editorsClass.finalTest = editor
        })()
    }

    function showGoEditors() {
        showEditors(GoEditors, helpers.languages.Go)
    }

    function showPythonEditors() {
        showEditors(PythonEditors, helpers.languages.Python)
    }

    function handleLanguageSelect(event) {
        selectedLanguages = event.detail
        if (selectedLanguages === null) {
            isGoEditors = false
            isPythonEditors = false
            GoEditors.reset()
            PythonEditors.reset()
        } else {
            selectedLanguages = selectedLanguages.map(x => x.value)
            if ($errors["languages"] !== undefined && $errors["languages"] !== "" && selectedLanguages.length !== 0) {
                $errors["languages"] = ""
            }
            if (selectedLanguages.includes(helpers.languages.Go)) {
                if (!isGoEditors) {
                    showGoEditors()
                }
            } else {
                isGoEditors = false
                GoEditors.reset()
            }
            if (selectedLanguages.includes(helpers.languages.Python)) {
                if (!isPythonEditors) {
                    showPythonEditors()
                }
            } else {
                isPythonEditors = false
                PythonEditors.reset()
            }
        }
    }
</script>

<svelte:head>
    <link href="/css/quill.snow.css" rel="stylesheet">
</svelte:head>

<h1 class="title">Add a task</h1>

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
            <ShowEditors lang={helpers.languages.Go} error={$errors.go}/>
        {/if}

        {#if isPythonEditors}
            <ShowEditors lang={helpers.languages.Python} error={$errors.python}/>
        {/if}

        <br><br>
        <button>Submit</button>
    </form>
</div>

<style>
  :global(.cm-scroller) {
    overflow: auto;
    max-height: 400px !important;
  }
</style>
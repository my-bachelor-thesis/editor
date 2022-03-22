<script>
    import {quill} from 'svelte-quill'
    import {createForm} from "svelte-forms-lib"
    import Split from "split-grid"
    import Select from 'svelte-select'
    import * as helpers from "./helpers"
    import * as store from "./store";
    import {get} from "svelte/store";

    const widthConstant = 0.96
    let widthSolutionGo = 0, widthTestGo = 0, widthSolutionPython = 0, widthTestPython = 0
    let solutionGoEditor, testGoEditor, solutionPythonEditor, testPythonEditor
    let gridStyle = "1fr 10px 1fr"
    const languages = [
        {value: 'go', label: 'Go'},
        {value: 'python', label: 'Python'},
    ]
    // TODO: make map or object from this
    let isGo = false, isPython = false
    let selectedLanguages = []

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
            is_published: "",
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
            return errs
        },
        onSubmit: values => {
            values.description = descriptionContent.html
            if (isGo) {
                values.go_solution = solutionGoEditor.state.doc.toString()
                values.go_test = testGoEditor.state.doc.toString()
            }
            if (isPython) {
                values.go_solution = solutionPythonEditor.state.doc.toString()
                values.go_test = testPythonEditor.state.doc.toString()
            }
            console.log(values)
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
    let options = {placeholder: "Write something from outside...",}
    let descriptionContent = {html: '', text: ''}

    // add tests and default solutions
    function loadGoEditors() {
        (async () => {
            await helpers.waitForElementWithId("solution-go")
            solutionGoEditor = helpers.Editor.newGoEditor(document.getElementById("solution-go"))
            await helpers.waitForElementWithId("test-go")
            testGoEditor = helpers.Editor.newGoEditor(document.getElementById("test-go"))
            Split({
                columnGutters: [{
                    track: 1,
                    element: document.querySelector('.gutter-col-1'),
                }]
            })
        })()
    }

    // add tests and default solutions
    function loadPythonEditors() {
        (async () => {
            await helpers.waitForElementWithId("solution-python")
            solutionGoEditor = helpers.Editor.newPythonEditor(document.getElementById("solution-python"))
            await helpers.waitForElementWithId("test-python")
            testGoEditor = helpers.Editor.newPythonEditor(document.getElementById("test-python"))
            Split({
                columnGutters: [{
                    track: 1,
                    element: document.querySelector('.gutter-col-1'),
                }]
            })
        })()
    }

    $: if (descriptionContent.text) {
        if ($errors["description"] !== undefined && $errors["description"] !== "" && !isQuillEmpty(descriptionContent)) {
            $errors["description"] = ""
        }
    }

    function handleLanguageSelect(event) {
        selectedLanguages = event.detail
        if (selectedLanguages === null) {
            isGo = false
            isPython = false
        } else {
            selectedLanguages = selectedLanguages.map(x => x.value)
            if ($errors["languages"] !== undefined && $errors["languages"] !== "" && selectedLanguages.length !== 0) {
                $errors["languages"] = ""
            }
            if (selectedLanguages.includes("go")) {
                if (!isGo){
                    loadGoEditors()
                }
                isGo = true
            } else {
                isGo = false
            }
            if (selectedLanguages.includes("python")) {
                if (!isPython) {
                    loadPythonEditors()
                }
                isPython = true
            } else {
                isPython = false
            }
        }
    }
</script>

<svelte:head>
    <link href="/css/quill.snow.css" rel="stylesheet">
</svelte:head>

<h1>Add a task</h1>

{#if postError}
    <div class="error">{postError}</div>
{/if}

<div class="form">
    <form on:submit={handleSubmit}>
        <label for="title">title</label><br>
        <input bind:value={$form.title} on:change={handleChange} id="title" name="title" type="text"
               placeholder="Title">
        {#if $errors.title}
            <div class="error">{$errors.title}</div>
        {/if}

        <br>
        <label for="difficulty">select difficulty</label><br>
        <select id="difficulty" name="difficulty" bind:value={$form.difficulty} on:change={handleChange}>
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
        </select>
        {#if $errors.difficulty}
            <div class="error">{$errors.difficulty}</div>
        {/if}

        <br/><br/>
        <p><b>description</b></p>
        <div class="editor" use:quill={options} on:text-change={e => descriptionContent = e.detail}></div>
        {#if $errors.description}
            <div class="error">{$errors.description}</div>
        {/if}

        <br>
        <h3>Add tests and default solutions</h3>

        <Select on:select={handleLanguageSelect} items={languages} isMulti={true}/>
        {#if $errors.languages}
            <div class="error">{$errors.languages}</div>
        {/if}

        {#if isPython}
            <br>
            <div class="grid" style="grid-template-columns: {gridStyle}">
                <div bind:clientWidth={widthSolutionPython}>
                    <div class="editor-label">Default Python solution</div>
                    <div id="solution-python" style="width: {widthSolutionPython*widthConstant}px"></div>
                </div>

                <div class="gutter-col gutter-col-1">
                    <div class="vl"></div>
                </div>

                <div bind:clientWidth={widthTestPython}>
                    <div class="editor-label">Python test</div>
                    <div id="test-python" style="width: {widthSolutionPython*widthConstant}px"></div>
                </div>
            </div>
        {/if}

        {#if isGo}
            <br>
            <div class="grid" style="grid-template-columns: {gridStyle}">
                <div bind:clientWidth={widthSolutionGo}>
                    <div class="editor-label">Default Go solution</div>
                    <div id="solution-go" style="width: {widthSolutionGo*widthConstant}px"></div>
                </div>

                <div class="gutter-col gutter-col-1">
                    <div class="vl"></div>
                </div>

                <div bind:clientWidth={widthTestGo}>
                    <div class="editor-label">Go test</div>
                    <div id="test-go" style="width: {widthTestGo*widthConstant}px"></div>
                </div>
            </div>
        {/if}

        <br/>
        <label for="publish">Publish task</label>
        <input id="publish" name="publish" type=checkbox bind:checked={$form.is_published}>

        <br/><br/>
        <button>Submit</button>
    </form>
</div>

<style>
    :global(.cm-scroller) {
        overflow: auto;
        max-height: 400px !important;
    }

    .editor-label {
        text-align: center;
    }
</style>
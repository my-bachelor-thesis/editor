<script>
    import * as helpers from "./helpers";
    import {get} from "svelte/store";
    import * as store from "./store";
    import {tick} from "svelte";
    import {EditorView} from "@codemirror/view";
    import SuccessMessage from "./partial_components/messages/SuccessMessage.svelte";
    import ErrorMessage from "./partial_components/messages/ErrorMessage.svelte";
    import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from "sveltestrap";

    let skipFetch = helpers.redirectIfNotAdmin()

    let message

    const solutionId = new URLSearchParams(window.location.search).get("id")

    let solutionPromise = helpers.getNeverEndingPromise()
    if (!skipFetch) {
        solutionPromise = helpers.fetchJson(`${get(store.url)}/user-solution/${solutionId}`)
    }

    let editor
    solutionPromise.then(async res => {
        await tick()
        let solutionEditor = document.getElementById("solution-editor")
        editor = helpers.Editor.newEditor(res.language, solutionEditor, EditorView.editable.of(false))
        editor.dispatch({
            changes: {from: 0, to: editor.state.doc.length, insert: res.code},
        })
    })

    let modalOpened = false
    let modalError = ""
    let reasonForHiding = ""
    const toggleModal = () => (modalOpened = !modalOpened);

    function handleHide() {
        if (reasonForHiding === "") {
            modalError = "the reason for hiding can't be empty"
            return
        }
        helpers.postJson(`${get(store.url)}/user-solution/delete`, JSON.stringify(
            {id: parseInt(solutionId), reason: reasonForHiding}
        )).then(_ => {
            message = "Hidden successfully"
            toggleModal()
        }).catch(err => modalError = err)
    }
</script>

<h1 class="small-margin">Code of the solution:</h1>

<SuccessMessage msg={message}/>

{#await solutionPromise}
    <p>Loading the solution...</p>
{:then res}
    <div>
        <Button color="danger" outline on:click={toggleModal}>Hide the solution from the statistic</Button>
        <Modal isOpen={modalOpened} {toggleModal}>
            <ModalHeader {toggleModal}>Hide</ModalHeader>
            <ModalBody>
                <ErrorMessage msg={modalError}/>
                <Input bind:value={reasonForHiding} type="textarea"
                       placeholder="type the reason for hiding here"></Input>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" on:click={handleHide}>Hide</Button>
                <Button color="secondary" on:click={toggleModal}>Cancel</Button>
            </ModalFooter>
        </Modal>
    </div>
    <br>
    <div id="solution-editor"></div>
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}
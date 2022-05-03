<script>
    import {Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader} from "sveltestrap";
    import * as helpers from "../../helpers"
    import {get} from "svelte/store";
    import * as store from "../../store";
    import ErrorMessage from "../messages/ErrorMessage.svelte";
    import SuccessMessage from "../messages/SuccessMessage.svelte";

    export let language, type, selectedStore

    let isOpened = false

    function toggle() {
        isOpened = !isOpened
        postError = ""
        postMsg = ""
    }

    let inputId, postUrl, labelFunc

    if (type === "test") {
        inputId = `changeTest${language.number}Name`
        postUrl = `${get(store.url)}/editor/change-name-in-test`
        labelFunc = helpers.makeTestLabel
    } else {
        inputId = `changeSolution${language.number}Name`
        postUrl = `${get(store.url)}/editor/change-name-in-usersolution`
        labelFunc = helpers.makeSolutionLabel
    }

    let isDisabled
    selectedStore.subscribe(val => {
        isDisabled = val.public || val.final
    })

    function changeAndToggle() {
        helpers.postJson(postUrl, JSON.stringify({
            id: parseInt(get(selectedStore).value),
            name: get(selectedStore).name
        })).then(
            () => {
                postError = ""
                postMsg = "updated successfully"
                let selected = get(selectedStore)
                selected.label = labelFunc(selected)
                selectedStore.set(selected)

                let inSelector = type === "test" ? language.solutionsAndTestsSelector.tests : language.solutionsAndTestsSelector.solutions
                let indexInSelector = inSelector.findIndex(x => x.value === selected.value)
                inSelector[indexInSelector] = selected
            }).catch(err => {
            postMsg = ""
            postError = err
        })
    }

    let postError, postMsg
</script>

<Button disabled={isDisabled} color="primary" size="sm" on:click={toggle}>Change name</Button>

<Modal isOpen={isOpened} {toggle}>
    <ModalHeader {toggle}>Change name</ModalHeader>
    <ModalBody>
        <ErrorMessage msg={postError}/>
        <SuccessMessage msg={postMsg}/>
        <FormGroup>
            <Label for={inputId}>Name</Label>
            <Input bind:value={$selectedStore.name} id={inputId} placeholder="type name here"/>
        </FormGroup>
    </ModalBody>
    <ModalFooter>
        <Button color="primary" on:click={changeAndToggle}>Change</Button>
        <Button color="secondary" on:click={toggle}>Cancel</Button>
    </ModalFooter>
</Modal>
<script>
    import {Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader} from "sveltestrap";

    export let id

    let name = ""
    let isOpened = false
    const toggle = () => (isOpened = !isOpened)
</script>

<div class="grid-button">
    <Button color="secondary" size="sm" on:click={toggle}>Change name</Button>
</div>

<Modal isOpen={isOpened} {toggle}>
    <ModalHeader {toggle}>Change name</ModalHeader>
    <ModalBody>
        <FormGroup>
            <Label for={id}>Name</Label>
            <Input bind:value={name} id={id} placeholder="type name here"/>
        </FormGroup>
    </ModalBody>
    <ModalFooter>
        <Button color="primary" on:click={toggle}>Change</Button>
        <Button color="secondary" on:click={toggle}>Cancel</Button>
    </ModalFooter>
</Modal>
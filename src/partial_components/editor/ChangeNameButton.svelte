<script>
    import {Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader} from "sveltestrap";

    export let id

    let solution1Name = ""
    let isOpened = false
    const toggle = () => (isOpened = !isOpened)
</script>

<Button color="secondary" class="btn-sm" on:click={toggle}>Change name</Button>
<Modal isOpen={isOpened} {toggle}>
    <ModalHeader {toggle}>Change name</ModalHeader>
    <ModalBody>
        <FormGroup>
            <Label for={id}>Name</Label>
            <Input bind:value={solution1Name} id={id} placeholder="type name here"/>
        </FormGroup>
    </ModalBody>
    <ModalFooter>
        <Button color="primary" on:click={toggle}>Change</Button>
        <Button color="secondary" on:click={toggle}>Cancel</Button>
    </ModalFooter>
</Modal>
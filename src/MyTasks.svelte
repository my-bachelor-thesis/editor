<script>
    import SuccessMessage from "./partial_components/messages/SuccessMessage.svelte"
    import * as helpers from "./helpers"
    import {get} from "svelte/store"
    import * as store from "./store"
    import ErrorMessage from "./partial_components/messages/ErrorMessage.svelte";
    import {Button, Container, Modal, ModalBody, ModalFooter, ModalHeader} from "sveltestrap";
    import Task from "./partial_components/tasks/Task.svelte";
    import {navigate} from "svelte-navigator";
    import FilterBar from "./partial_components/tasks/FilterBar.svelte";
    import MyPagination from "./partial_components/tasks/MyPagination.svelte";

    // redirect if not logged in
    let skipFetch = helpers.redirectIfNotLoggedIn()

    let postError = ""
    let message = new URLSearchParams(window.location.search).get('msg')

    let currentPage = 1

    let tasks = []
    let tasksPromise = helpers.getNeverEndingPromise()
    tasksPromise.then(data => tasks = data).catch(err => postError = err)

    let endpoint = "my-tasks/all"

    function handlePublish(taskId) {
        helpers.postJson(`${get(store.url)}/my-tasks/publish`, JSON.stringify({id: taskId})).then(
            () => {
                let index = tasks.findIndex(x => x.id === taskId)
                tasks[index].is_published = true
                if (!get(store.isAdmin)) {
                    message = "Published successfully. Your task will have to be reviewed by an admin."
                } else {
                    message = "Published successfully"
                }
            }).catch((err) => postError = err
        )
    }

    function handleUnpublish(taskId) {
        helpers.postJson(`${get(store.url)}/my-tasks/unpublish`, JSON.stringify({id: taskId})).then(
            () => {
                let index = tasks.findIndex(x => x.id === taskId)
                tasks[index].is_published = false
                message = "Unpublished successfully"
            }).catch((err) => postError = err
        )
    }

    function handleDelete(taskId) {
        deleteModalToggle()
        helpers.postJson(`${get(store.url)}/my-tasks/delete`, JSON.stringify({id: taskId})).then(
            () => {
                tasks.splice(tasks.findIndex(t => t.id === taskId), 1)
                tasks = [...tasks]
                message = "Deleted successfully"
            }).catch((err) => postError = err
        )
    }

    function handleEdit(taskId) {
        navigate(`edit-task?id=${taskId}`)
    }

    $: if (tasksPromise) {
        (async () => tasksPromise.then(res => tasks = res))()
    }

    // filters

    let sortByDate = "desc"
    let searchTerm = ""
    let difficulty = "all"
    let notPublished = ""

    function handleFilterReturns(getPage) {
        let p = currentPage
        if (getPage) {
            p = getPage
        }
        if (!skipFetch) {
            return helpers.fetchJson(
                `${get(store.url)}/${endpoint}?search=${searchTerm}&date=${sortByDate}&difficulty=${difficulty}&page=${p}&not-published=${notPublished}`)
        }
        return helpers.getNeverEndingPromise()
    }

    let paginationFetch = false

    function doPaginationFetch() {
        // trigger fetching
        paginationFetch = !paginationFetch
    }

    // event and getPage arguments are optional
    function handleFilter(event, getPage) {
        if (event) {
            event.preventDefault()
            doPaginationFetch()
            currentPage = 1
        }
        tasksPromise = handleFilterReturns(getPage)
    }

    let deleteModalOpened = false
    const deleteModalToggle = () => (deleteModalOpened = !deleteModalOpened)
</script>

<h1 class="small-margin">My tasks</h1>
<br>

<SuccessMessage msg={message}/>
<ErrorMessage msg={postError}/>

<Container>
    <FilterBar
            bind:currentPage={currentPage}
            handleFilter={handleFilter}
            bind:sortByDate={sortByDate}
            bind:searchTerm={searchTerm}
            bind:difficulty={difficulty}
            bind:notPublished={notPublished}
            showNotPublished="true"
    />
    <br>
</Container>


{#await tasksPromise}
    <p>Loading tasks...</p>
{:then _}
    {#if tasks.length > 0}
        <div>
            <br>
            <Container>
                {#each tasks as task}
                    <Task task={task} showStatistic={false}/>
                    {#if task.is_published}
                        <button on:click={() => handleUnpublish(task.id)}>Unpublish</button>
                    {:else}
                        <button on:click={() => handlePublish(task.id)}>Publish</button>
                        <button on:click={() => handleEdit(task.id)}>Edit</button>
                        <button on:click={deleteModalToggle}>Delete</button>
                        <Modal isOpen={deleteModalOpened} {deleteModalToggle}>
                            <ModalHeader {deleteModalToggle}>Delete task</ModalHeader>
                            <ModalBody>
                                This task will be deleted
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" on:click={() => handleDelete(task.id)}>Delete</Button>
                                <Button color="secondary" on:click={deleteModalToggle}>Cancel</Button>
                            </ModalFooter>
                        </Modal>
                    {/if}
                    <hr>
                {/each}
            </Container>
        </div>
    {:else}
        <div class="not-found-err">No tasks found</div>
    {/if}
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}

<MyPagination
        bind:paginationFetch={paginationFetch}
        bind:currentPage={currentPage}
        nextPageFunc={handleFilterReturns}
/>
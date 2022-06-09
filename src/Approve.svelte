<script>
    import SuccessMessage from "./partial_components/messages/SuccessMessage.svelte"
    import * as helpers from "./helpers"
    import {get} from "svelte/store"
    import * as store from "./store"
    import ErrorMessage from "./partial_components/messages/ErrorMessage.svelte";
    import {Button, Container, Input, Modal, ModalBody, ModalFooter, ModalHeader} from "sveltestrap";
    import Task from "./partial_components/tasks/Task.svelte";
    import FilterBar from "./partial_components/tasks/FilterBar.svelte";
    import MyPagination from "./partial_components/tasks/MyPagination.svelte";

    let skipFetch = helpers.redirectIfNotAdmin()

    let postError = ""
    let message = new URLSearchParams(window.location.search).get('msg')

    let currentPage = 1

    let tasks = []
    let tasksPromise = helpers.getNeverEndingPromise()
    tasksPromise.then(data => tasks = data).catch(err => postError = err)

    let endpoint = "not-approved/all"

    function handleApprove(taskId) {
        helpers.postJson(`${get(store.url)}/not-approved/approve`, JSON.stringify({id: taskId})).then(
            () => {
                tasks.splice(tasks.findIndex(t => t.id === taskId), 1)
                tasks = [...tasks]
                message = "Approved successfully"
            }).catch((err) => postError = err
        )
    }

    $: if (tasksPromise) {
        (async () => tasksPromise.then(res => tasks = res))()
    }

    let denyModalError = ""
    let reasonForDenial = ""
    let isDenyModalOpened = false

    const toggleDenyModal = () => {
        isDenyModalOpened = !isDenyModalOpened
        denyModalError = ""
        reasonForDenial = ""
    }

    function denyTask(task) {
        denyModalError = ""

        if (!reasonForDenial) {
            denyModalError = "no reason for denial entered"
            return
        }

        helpers.postJson(`${get(store.url)}/not-approved/deny`, JSON.stringify({
            reason: reasonForDenial,
            author_id: parseInt(task.author_id),
            task_id: parseInt(task.id)
        })).then(() => {
            tasks.splice(tasks.findIndex(t => t.id === task.id), 1)
            tasks = [...tasks]
            message = "Denied successfully"
            toggleDenyModal()
        }).catch(err => denyModalError = err)
    }

    // filters

    let sortByDate = "desc"
    let searchTerm = ""
    let difficulty = "all"

    function handleFilterReturns(getPage) {
        let p = currentPage
        if (getPage) {
            p = getPage
        }
        if (!skipFetch) {
            return helpers.fetchJson(
                `${get(store.url)}/${endpoint}?search=${searchTerm}&date=${sortByDate}&difficulty=${difficulty}&page=${p}`);
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
</script>

<h1 class="small-margin">Approve tasks</h1>

<SuccessMessage msg={message}/>
<ErrorMessage msg={postError}/>

<Container>
    <FilterBar
            bind:currentPage={currentPage}
            handleFilter={handleFilter}
            bind:sortByDate={sortByDate}
            bind:searchTerm={searchTerm}
            bind:difficulty={difficulty}
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
                    <button on:click={() => handleApprove(task.id)}>Approve</button>

                    <button on:click={toggleDenyModal}>Deny</button>
                    <Modal isOpen={isDenyModalOpened} {toggleDenyModal}>
                        <ModalHeader {toggleDenyModal}>Give a reason for denial (it will be sent to the user)
                        </ModalHeader>
                        <ModalBody>
                            <ErrorMessage msg={denyModalError}/>
                            <Input bind:value={reasonForDenial} type="textarea"
                                   placeholder="type the reason here"></Input>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" on:click={() => denyTask(task)}>Deny</Button>
                            <Button color="secondary" on:click={toggleDenyModal}>Cancel</Button>
                        </ModalFooter>
                    </Modal>

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
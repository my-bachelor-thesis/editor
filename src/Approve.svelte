<script>
    import SuccessMessage from "./partial_components/messages/SuccessMessage.svelte"
    import * as helpers from "./helpers"
    import {get} from "svelte/store"
    import * as store from "./store"
    import ErrorMessage from "./partial_components/messages/ErrorMessage.svelte";
    import {Container} from "sveltestrap";
    import Task from "./partial_components/tasks/Task.svelte";
    import FilterBar from "./partial_components/tasks/FilterBar.svelte";

    let postError = ""
    let message = new URLSearchParams(window.location.search).get('msg')

    let tasks = []
    let tasksPromise = helpers.fetchJson(`${get(store.url)}/not-approved/all`).then(data => tasks = data).catch(err => postError = err)

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
</script>

<h1 class="small-margin">My tasks</h1>

<SuccessMessage msg={message}/>
<ErrorMessage msg={postError}/>

<Container>
    <FilterBar bind:tasksPromise={tasksPromise} endpoint="not-approved/all"/>
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
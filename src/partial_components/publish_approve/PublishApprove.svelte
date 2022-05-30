<script>
    import SuccessMessage from "../../partial_components/messages/SuccessMessage.svelte"
    import * as helpers from "../../helpers"
    import {get} from "svelte/store"
    import * as store from "../../store"
    import ErrorMessage from "../../partial_components/messages/ErrorMessage.svelte";
    import {Container} from "sveltestrap";
    import Task from "../../partial_components/tasks/Task.svelte";
    import {navigate} from "svelte-navigator";

    export let title, buttonText, getTasksFromUrl, postTasksToUrl, successMsg

    let message = "", postError = ""

    let tasks = []
    let tasksPromise = helpers.fetchJson(`${get(store.url)}${getTasksFromUrl}`).then(data => tasks = data).catch(err => postError = err)

    function handleButton(id) {
        helpers.postJson(`${get(store.url)}${postTasksToUrl}`, JSON.stringify({id: id})).then(
            () => {
                message = successMsg
                tasks.splice(tasks.findIndex(t => t.id === id), 1)
                tasks = [...tasks]
            }).catch((err) => postError = err
        )
    }

    function editTaskButton(id) {
        navigate(`edit-task?id=${id}`)
    }
</script>

<h1 class="small-margin">{title}</h1>

<SuccessMessage msg={message}/>
<ErrorMessage msg={postError}/>

{#await tasksPromise}
    <p>Loading tasks...</p>
{:then _}
    {#if tasks.length > 0}
        <div>
            <br>
            <Container>
                {#each tasks as task}
                    <Task task={task}/>
                    <button on:click={() => handleButton(task.id)}>{buttonText}</button>
                    {#if buttonText === "Publish"}
                        <button on:click={() => editTaskButton(task.id)}>Edit task</button>
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

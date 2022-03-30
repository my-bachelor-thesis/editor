<script>
    import * as helpers from "./helpers"
    import * as store from "./store"
    import {get} from "svelte/store"
    import SuccessMessage from "./partial_components/messages/SuccessMessage.svelte"
    import {Container} from "sveltestrap";
    import Task from "./partial_components/tasks/Task.svelte";

    let tasksPromise = helpers.fetchJson(`${get(store.url)}/home/all-tasks`)

    const message = new URLSearchParams(window.location.search).get('msg')
</script>

<SuccessMessage msg={message}/>

{#await tasksPromise}
    <p>Loading tasks...</p>
{:then tasks}
    {#if tasks.length > 0}
        <div>
            <br>
            <Container>
                {#each tasks as task}
                    <Task task={task}/>
                    <hr>
                {/each}
            </Container>
        </div>
    {:else}
        <div class="not-found-err">No tasks found</div>
    {/if}
{/await}
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

<div id="logo-home-center">
    <h1>My bachelor's thesis</h1>
    <!--    TODO: dynamic height-->
    <img src="images/logo-white.png" alt="" height="100px">
</div>

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
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}

<style>
    #logo-home-center {
        align-content: center;
        text-align: center;
        margin: 4%;
    }
    #logo-home-center h1 {
        font-weight: bold;
        margin-bottom: 2%;
    }
</style>
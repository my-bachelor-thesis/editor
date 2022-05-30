<script>
    import * as helpers from "./helpers"
    import * as store from "./store"
    import {get} from "svelte/store"
    import SuccessMessage from "./partial_components/messages/SuccessMessage.svelte"
    import {Container} from "sveltestrap";
    import Task from "./partial_components/tasks/Task.svelte";
    import FilterBar from "./partial_components/tasks/FilterBar.svelte";

    let tasksPromise = helpers.fetchJson(`${get(store.url)}/home/all-tasks`)

    const message = new URLSearchParams(window.location.search).get('msg')

    let logoWidth = Math.floor(window.innerWidth / 1.5) + "px"
</script>

<SuccessMessage msg={message}/>

<div id="logo-home-center">
    <h1 style="font-size: xxx-large">My bachelor's thesis</h1>
    <img src="images/logo-white.png" alt="" width={logoWidth}>
</div>

<Container>
    <FilterBar bind:tasksPromise={tasksPromise} endpoint="home/all-tasks"/>
    <br>
</Container>

{#await tasksPromise}
    <p>Loading tasks...</p>
{:then tasks}
    {#if tasks.length > 0}
        <div>
            <Container>
                {#each tasks as task}
                    <Task task={task} showStatistic={true}/>
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
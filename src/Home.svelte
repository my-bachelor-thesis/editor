<script>
    import SuccessMessage from "./partial_components/messages/SuccessMessage.svelte"
    import {Container} from "sveltestrap";
    import Task from "./partial_components/tasks/Task.svelte";
    import FilterBar from "./partial_components/tasks/FilterBar.svelte";
    import MyPagination from "./partial_components/tasks/MyPagination.svelte";
    import * as helpers from "./helpers";
    import {get} from "svelte/store";
    import * as store from "./store";

    let currentPage = 1

    let tasksPromise = helpers.getNeverEndingPromise()

    const message = new URLSearchParams(window.location.search).get('msg')

    let endpoint = "home/all-tasks"

    // filters

    let sortByName = "asc", sortByDate = "desc"
    let searchTerm = ""
    let difficulty = "all"

    function handleFilterReturns(getPage) {
        let p = currentPage
        if (getPage) {
            p = getPage
        }
        return helpers.fetchJson(
            `${get(store.url)}/${endpoint}?search=${searchTerm}&date=${sortByDate}&name=${sortByName}&difficulty=${difficulty}&page=${p}`);
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

    let innerWidth
</script>

<svelte:window bind:innerWidth/>

<SuccessMessage msg={message}/>

<div id="logo-home-center">
    <h1 style="font-size: xxx-large">My bachelor's thesis</h1>
    <img src="images/logo-white.png" alt="" width={Math.floor(innerWidth / 1.5)}px>
</div>

<Container>
    <FilterBar
            bind:currentPage={currentPage}
            handleFilter={handleFilter}
            bind:sortByDate={sortByDate}
            bind:sortByName={sortByName}
            bind:searchTerm={searchTerm}
            bind:difficulty={difficulty}
    />
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

<MyPagination
        bind:paginationFetch={paginationFetch}
        bind:currentPage={currentPage}
        nextPageFunc={handleFilterReturns}
/>

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
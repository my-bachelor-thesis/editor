<script>
    import {Button, Input} from "sveltestrap";
    import * as helpers from "../../helpers";
    import {get} from "svelte/store";
    import * as store from "../../store";

    export let tasksPromise, endpoint

    let searchTerm = ""
    let sortByName = "asc", sortByDate = "desc"
    $: sortDateIcon = sortByDate === "asc" ? "up" : "down"
    $: sortNameIcon = sortByName === "asc" ? "up" : "down"

    function ascDescFlip(s) {
        if (s === "asc") {
            return "desc"
        }
        return "asc"
    }

    let difficulty
    let difficultyOptions = [
        {id: "all", text: "All difficulties"},
        {id: "easy", text: "Easy"},
        {id: "medium", text: "Medium"},
        {id: "hard", text: "Hard"},
    ]

    function handleFilter(event) {
        event.preventDefault()
        tasksPromise = helpers.fetchJson(
            `${get(store.url)}/${endpoint}?search=${searchTerm}&date=${sortByDate}&name=${sortByName}&difficulty=${difficulty}`);
    }

    function handleNameFiler(event) {
        sortByName = ascDescFlip(sortByName)
        handleFilter(event)
    }

    function handleDateFilter(event) {
        sortByDate = ascDescFlip(sortByDate)
        handleFilter(event)
    }

    let searchBarHeight
</script>

<div style="display: flex;">
    <Input class="d-block d-md-none" bind:value={searchTerm} style="max-width: 50%;" plantext
           placeholder="Filter tasks by a keyword"></Input>
    <Button class="d-block d-md-none" color="primary" on:click={handleFilter}>Search</Button>
</div>

<div style="display: flex;" bind:clientHeight={searchBarHeight}>
    <Input class="d-none d-md-block" bind:value={searchTerm} style="max-width: 50%;" plantext
           placeholder="Filter tasks by a keyword"></Input>
    <Button class="d-none d-md-block" color="primary" on:click={handleFilter} style="margin-right: 3%;">Search</Button>

    <Button outline color="secondary" on:click={handleDateFilter}
            style="outline: none;">Date
    </Button>
    <img height="{searchBarHeight}" src="images/sort-{sortDateIcon}.svg" alt="sort up">

    <Button outline color="secondary" on:click={handleNameFiler}
            style="margin-left: 1%;outline: none;">Name
    </Button>
    <img style="margin-right: 1%" height="{searchBarHeight}" src="images/sort-{sortNameIcon}.svg" alt="sort down">

    <select bind:value={difficulty} on:change="{handleFilter}">
        {#each difficultyOptions as option}
            <option value="{option.id}">{option.text}</option>
        {/each}
    </select>
</div>
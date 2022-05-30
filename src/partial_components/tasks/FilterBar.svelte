<script>
    import * as helpers from "../../helpers";
    import {get} from "svelte/store";
    import * as store from "../../store";
    import {Button, Form, Input} from "sveltestrap";

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

    function handleFilter(event) {
        event.preventDefault()
        tasksPromise = helpers.fetchJson(
            `${get(store.url)}/${endpoint}?search=${searchTerm}&date=${sortByDate}&name=${sortByName}`);
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

<Form>
    <div style="display: flex" bind:clientHeight={searchBarHeight}>
        <Input bind:value={searchTerm} style="max-width: 30%" plantext
               placeholder="Filter tasks by a keyword"></Input>
        <Button color="primary" on:click={handleFilter}>Search</Button>

        <Button outline color="secondary" on:click={handleDateFilter}
                style="margin-left: 3%;outline: none;">Date
        </Button>
        <img height="{searchBarHeight}" src="images/sort-{sortDateIcon}.svg" alt="sort up">

        <Button outline color="secondary" on:click={handleNameFiler}
                style="margin-left: 1%;outline: none;">Name
        </Button>
        <img height="{searchBarHeight}" src="images/sort-{sortNameIcon}.svg" alt="sort down">
    </div>
</Form>
<script>
    import {Button, Input} from "sveltestrap";

    export let currentPage, handleFilter, sortByDate, sortByName, searchTerm, difficulty, notPublished = undefined,
        showNotPublished = undefined

    $: sortDateIcon = sortByDate === "asc" ? "up" : "down"
    $: sortNameIcon = sortByName === "asc" ? "up" : "down"

    $: notPublishedText = notPublished ? "Show all" : "Not published"

    function ascDescFlip(s) {
        if (s === "asc") {
            return "desc"
        }
        return "asc"
    }

    let difficultyOptions = [
        {id: "all", text: "All difficulties"},
        {id: "easy", text: "Easy"},
        {id: "medium", text: "Medium"},
        {id: "hard", text: "Hard"},
    ]

    function handleNameFiler(event) {
        sortByName = ascDescFlip(sortByName)
        handleFilter(event)
    }

    function handleDateFilter(event) {
        sortByDate = ascDescFlip(sortByDate)
        handleFilter(event)
    }

    function handleNotPublished(event) {
        notPublished = notPublished ? "" : "true"
        handleFilter(event)
    }

    let searchBarHeight

    $: if (currentPage) {
        handleFilter()
    }
</script>

<div style="display: flex;">
    <Input class="d-block d-md-none" bind:value={searchTerm} plantext
           placeholder="Filter tasks by a keyword"></Input>
    <Button class="d-block d-md-none" color="primary" on:click={handleFilter}>Search</Button>
</div>

<div style="display: flex;" bind:clientHeight={searchBarHeight}>
    <Input class="d-none d-md-block" bind:value={searchTerm} style="max-width: 50%;" plantext
           placeholder="Filter tasks by a keyword"></Input>
    <Button class="d-none d-md-block" color="primary" on:click={handleFilter} style="margin-right: 3%;">Search</Button>

    <Button outline color="secondary" on:click={handleDateFilter}>Date
    </Button>
    <img height="{searchBarHeight}" src="images/sort-{sortDateIcon}.svg" alt="sort up">

    <Button outline color="secondary" on:click={handleNameFiler}
            style="margin-left: 1%;">Name
    </Button>
    <img style="margin-right: 1%" height="{searchBarHeight}" src="images/sort-{sortNameIcon}.svg" alt="sort down">

    <select bind:value={difficulty} on:change="{handleFilter}" style="margin-right: 0.6%">
        {#each difficultyOptions as option}
            <option value="{option.id}">{option.text}</option>
        {/each}
    </select>

    {#if showNotPublished}
        <Button class="d-none d-md-block" outline color="secondary" on:click={handleNotPublished}
                style="margin-left: 1%;"><span class="no-wrap">{notPublishedText}</span>
        </Button>
    {/if}
</div>

{#if showNotPublished}
    <div style="display: flex;">
        <Button class="d-block d-md-none" outline color="secondary" on:click={handleNotPublished}>
            <span class="no-wrap">{notPublishedText}</span>
        </Button>
    </div>
{/if}
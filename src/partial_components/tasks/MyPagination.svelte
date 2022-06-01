<script>
    import {Pagination, PaginationItem, PaginationLink} from "sveltestrap";
    import * as helpers from "../../helpers";

    export let currentPage, nextPageFunc, paginationFetch

    function handlePaginationDecrease(event) {
        event.preventDefault()
        currentPage--
    }

    function handlePaginationIncrease(event) {
        event.preventDefault()
        currentPage++
    }

    let isNextPagePromise = helpers.getNeverEndingPromise()

    async function isNextPage() {
        let tasks = await nextPageFunc(currentPage + 1)
        isNextPagePromise = new Promise((resolve, _) => {
            if (tasks.length > 0) {
                resolve(true)
            } else {
                resolve(false)
            }
        })
    }

    $: if (paginationFetch || currentPage) {
        isNextPage()
    }
</script>

{#await isNextPagePromise}
    <p>Loading pagination...</p>
{:then isNextPage}

    <Pagination listClassName="justify-content-center" size="lg" list ariaLabel="Page navigation">
        {#if currentPage > 1}
            <PaginationItem>
                <PaginationLink previous on:click={handlePaginationDecrease}/>
            </PaginationItem>
            <PaginationItem>
                <PaginationLink on:click={handlePaginationDecrease}>{currentPage - 1}</PaginationLink>
            </PaginationItem>
        {:else}
            <PaginationItem disabled>
                <PaginationLink previous on:click={handlePaginationDecrease}/>
            </PaginationItem>
        {/if}
        <PaginationItem active>
            <PaginationLink>{currentPage}</PaginationLink>
        </PaginationItem>
        {#if isNextPage}
            <PaginationItem>
                <PaginationLink on:click={handlePaginationIncrease}>{currentPage + 1}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
                <PaginationLink next on:click={handlePaginationIncrease}/>
            </PaginationItem>
        {:else}
            <PaginationItem disabled>
                <PaginationLink next on:click={handlePaginationIncrease}/>
            </PaginationItem>
        {/if}

    </Pagination>

{:catch error}
    <p style="color: red">{error.message}</p>
{/await}


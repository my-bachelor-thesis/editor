<script>
    import * as helpers from "./helpers";
    import {get} from "svelte/store";
    import * as store from "./store";
    import AddTask from "./AddTask.svelte";
    import ErrorMessage from "./partial_components/messages/ErrorMessage.svelte";

    const taskId = new URLSearchParams(window.location.search).get("id")

    let fetchSavedSolutionPromise = helpers.fetchJson(`${get(store.url)}/edit-task/get-saved/${taskId}`)
</script>

{#await fetchSavedSolutionPromise}
    <p>loading task...</p>
{:then res}
    <AddTask savedTask={res}/>
{:catch error}
    <ErrorMessage msg={error.message}/>
{/await}
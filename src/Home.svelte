<script>
    import {Link} from "svelte-navigator"
    import * as helpers from "./helpers"
    import * as store from "./store"
    import {Col, Container, Row} from 'sveltestrap'

    let url = ""
    store.url.subscribe(val => {
        url = val
    })

    let tasksPromise = helpers.fetchJson(`${url}/home/all-tasks`)

    const message = new URLSearchParams(window.location.search).get('msg')
</script>

{#if message}
    <div class="msg">{message}</div>
{/if}

{#await tasksPromise}
    <p>Loading tasks...</p>
{:then tasks}
    <br>
    <Container>
        {#each tasks as task}
            <Row>
                <Col>
                    <Link to="/task?id={task.id}"><b>{task.title}</b></Link>
                    <p><b>Difficulty: </b>{task.difficulty}</p>
                    <p><b>Description: </b>{task.description}</p>
                    <p><b>Added on: </b>{task.added_on}</p>
                </Col>
                <br><hr>
            </Row>
        {/each}
    </Container>
{:catch error}
    <div class="error">{error.message}</div>
{/await}
<script>
    import {Button, Col, Row} from "sveltestrap"
    import {Link, navigate} from "svelte-navigator"

    export let task, showStatistic

    function redirectToStatisticPage() {
        navigate(`statistic?task-id=${task.id}`)
    }

    function getFirstWords(description) {
        return description.replace(/(<([^>]+)>)/gi, "").replace(/\s+/g, " ").trim().substring(0, 150)
    }
</script>

<Row>
    <Col>
        <Link to="/task?id={task.id}"><b>{task.title}</b></Link>
        <br><br>
        <div class="task-fields">
            <div><b>Difficulty: </b><span class="{task.difficulty}">{task.difficulty}</span></div>
                <div><b>Description: </b>{getFirstWords(task.text)}...
                    <Link style="color: grey;" to="/task?id={task.id}"><b> more</b></Link>
                </div>
            <div><b>Added on: </b>{task.added_on}</div>
        </div>
        {#if showStatistic}
            <Button style="margin-top: 0.5%" outline color="secondary" type="button" on:click={redirectToStatisticPage}>
                show stat
            </Button>
        {/if}
    </Col>
</Row>
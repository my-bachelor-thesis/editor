<script>
    import {Col, Row} from "sveltestrap"
    import {Link} from "svelte-navigator"

    export let task
</script>

<Row>
    <Col>
        <Link to="/task?id={task.id}"><b>{task.title}</b></Link>
        <br><br>
        <div class="task-fields">
            <div><b>Difficulty: </b><span class="{task.difficulty}">{task.difficulty}</span></div>
            {#if task.text.length > 150}
                <div><b>Description: </b>{@html task.text.substring(0, 150)}...
                    <Link style="color: grey;" to="/task?id={task.id}"><b>more</b></Link>
                </div>
            {:else}
                <div><b>Description: </b>{@html task.text}</div>
            {/if}
            <div><b>Added on: </b>{task.added_on}</div>
        </div>
    </Col>
</Row>

<style lang="scss">
  @import "./src/styles/global.scss";
</style>
<script>
    import { Tooltip } from 'sveltestrap';

    let img
    export let text
</script>

<div class="tooltip-wrapper">
    <img src="images/question-circle.svg" alt="tooltip" bind:this={img}>
    <Tooltip target={img}>{text}</Tooltip>
</div>

<style>
    .tooltip-wrapper {
        display: inline-block;
        margin-left: 1%;
        margin-right: 1%;
    }
</style>


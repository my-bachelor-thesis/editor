<script>
    import {Tooltip} from 'sveltestrap';

    let img
    export let text = undefined, imageWidthPercentage = undefined
    if (!imageWidthPercentage) {
        imageWidthPercentage = 100
    }
</script>

<div class="tooltip-wrapper">
    <img width="{imageWidthPercentage}%" src="images/question-circle.svg" alt="tooltip" bind:this={img}>
    <Tooltip target={img}>{text}</Tooltip>
</div>

<style>
    .tooltip-wrapper {
        display: inline-block;
        margin-left: 1%;
        margin-right: 1%;
    }
</style>


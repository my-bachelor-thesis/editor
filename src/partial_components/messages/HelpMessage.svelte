<script>
    import SvelteTooltip from 'svelte-tooltip';

    export let text
</script>

<div class="tooltip-wrapper">
    <SvelteTooltip tip={text} right color="#d9d5ed">
        <img src="images/question-circle.svg" alt="tooltip image">
    </SvelteTooltip>
</div>

<style>
    .tooltip-wrapper {
        display: inline-block;
        color: #000000;
        margin-left: 1%;
        margin-right: 1%;
    }
</style>

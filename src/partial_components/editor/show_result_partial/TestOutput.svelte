<script>
    import {AccordionItem} from 'sveltestrap'

    export let output, failed

    $: colorClass = failed ? "text-danger" : ""
</script>

<AccordionItem header="Test output" active={failed}>
    <div class="test-output {colorClass}">{decodeURIComponent(output.replace(/[0-9a-f]{2}/g, '%$&'))}</div>
</AccordionItem>

<style>
    .test-output {
        white-space: pre-wrap;
        border-style: hidden;
        border-width: thin;
    }
</style>
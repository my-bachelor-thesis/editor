<script>
    import {AccordionItem} from 'sveltestrap'

    export let output
</script>

<AccordionItem header="Test output">
    <div class="test-output">{output.replaceAll('^', '\n')}</div>
</AccordionItem>

<style>
    .test-output {
        white-space: pre-wrap;
        border-style: hidden;
        border-width: thin;
    }
</style>
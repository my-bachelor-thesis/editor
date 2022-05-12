<script>
    import {AccordionItem} from 'sveltestrap'

    export let msg
</script>

<AccordionItem header="Details from the run" active>
    <p class="error-msg"><b>{msg}</b></p>
</AccordionItem>
<script>
    export let msg, cssClass
</script>

{#if msg}
    <div class="{cssClass}">{msg}</div>
{/if}

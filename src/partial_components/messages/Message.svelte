<script>
    export let msg, cssClass
</script>

{#if msg}
    <div class="{cssClass}">{msg}</div>
{/if}

<style lang="scss">
  @import "./src/styles/global.scss";
</style>
<script>
    export let label, error, value, type, handleFunc
    let name = label.toLowerCase().replaceAll(" ", "_")
    const a = ""
</script>

<label for={name}>{label}</label><br>
{#if type === "text"}
    <input bind:value={value} on:change={handleFunc} id="{name}" name="{name}" type="text" placeholder="{label}">
{:else if type === "password"}
    <input bind:value={value} on:change={handleFunc} id="{name}" name="{name}" type="password" placeholder="{label}">
{/if}
{#if error}
    <div class="error">{error}</div>
{/if}<br>

<style lang="scss">
  @import "./src/styles/global.scss";
</style>
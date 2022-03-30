<script>
    export let label, error, value, type, handleFunc
    let name = label.toLowerCase().replaceAll(" ", "_")
    const a = ""
</script>

<label class="label-form" for={name}>{label}</label>
{#if type === "text"}
    <input class="input-form" bind:value={value} on:change={handleFunc} id="{name}" name="{name}" type="text"
           placeholder="{label}">
{:else if type === "password"}
    <input class="input-form" bind:value={value} on:change={handleFunc} id="{name}" name="{name}" type="password"
           placeholder="{label}">
{/if}

{#if error}
    <div class="error">{error}</div>
{/if}<br>

<script>
    import InputField from "./InputField.svelte"

    export let submitFunc, handleFunc, args
</script>

<div class="form">
    <form on:submit={submitFunc}>
        {#each args as arg}
            <InputField label={arg.label} error={arg.error} value={arg.value} type={arg.type}
                        handleFunc={handleFunc}/>
        {/each}
        <br>
        <button>Submit</button>
    </form>
</div>
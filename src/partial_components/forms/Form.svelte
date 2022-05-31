<script>
    import InputField from "./InputField.svelte"

    export let submitFunc, handleFunc, args, submitText

    $: numberOfErrors = args.filter(x => x.error).length

    if (!submitText) {
        submitText = "Submit"
    }
</script>

<div class="form">
    <form on:submit={submitFunc} onkeydown="return event.key !== 'Enter';">
        {#each args as arg}
            <InputField label={arg.label} error={arg.error} bind:value={arg.value} type={arg.type}
                        handleFunc={handleFunc}/>
        {/each}
        <button disabled={numberOfErrors > 0}>{submitText}</button>
    </form>
</div>

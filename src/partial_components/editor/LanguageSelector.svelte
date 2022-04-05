<script>
    import {Button} from "sveltestrap";

    export let changeLanguageFunc, languageName, languageNumber, initValues, hideLanguageFunc

</script>

<label for="language{languageNumber}-picker-select"><b>{languageNumber === "1" ? "First" : "Second"} language:</b></label>
<select name="language{languageNumber}-picker-select" id="language{languageNumber}-picker-select" bind:value={languageName}
        on:change={changeLanguageFunc}>
    {#each initValues.languages as lang}
        <option value={lang}>{lang}</option>
    {/each}
</select>
&nbsp;
<Button color="secondary" class="btn-sm" on:click={() => hideLanguageFunc(languageNumber)}>Deselect language</Button>
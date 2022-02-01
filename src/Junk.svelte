<script>
    let selected = 'arr';
    let options = {
        '1': 'foo',
        '2': 'bar',
        '3': 'baz'
    }

    function clicked() {
        options["4"] = "aaaa"
        selected = "aaaa"
// 		print()
    }

    function print() {
// 		console.log(selected)
    }
</script>

<button on:click={clicked}>
    click me
</button>

<select bind:value={selected} on:change={print}>
    <option value=null selected disabled>pick</option>
    {#each Object.entries(options) as [id, info]}
        {() => console.log('a')}
        <option selected={info === selected} value={info}>{info === selected}</option>
    {/each}
</select>
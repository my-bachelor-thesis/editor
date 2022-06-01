<script>
    import {fetchJson} from "./helpers";
    import * as store from "./store"
    import {get} from "svelte/store"
    import {Table} from 'sveltestrap'

    const taskId = new URLSearchParams(window.location.search).get("task-id");
    let url = get(store.url);

    let statisticPromise = fetchJson(`${url}/statistic/${taskId}`)

    let tableContent

    // also aoutput if lang is interpreted (see helsper)

    let groupedStatisticPromise = new Promise(async (resolve, reject) => {
        try {
            let statistic = await statisticPromise
            if (!statistic) {
                return resolve(null)
            }

            let groupedStatistic = new Map()
            for (let statisticEntry of statistic) {
                if (groupedStatistic.get(statisticEntry.language)) {
                    groupedStatistic.get(statisticEntry.language).push(statisticEntry)
                } else {
                    groupedStatistic.set(statisticEntry.language, [statisticEntry])
                }
            }

            for (const [lang, _] of Object.entries(groupedStatistic)) {
                groupedStatistic.set(lang, groupedStatistic.get(lang).sort((a, b) => a.real_time < b.real_time))
            }

            resolve(groupedStatistic)
        } catch (err) {
            reject(err)
        }
    });
</script>

<div class="small-margin">

    {#await groupedStatisticPromise}
        <p>loading statistic...</p>
    {:then res}
        {#if !res}
            <h1>Can't make a statistic, there're no user solutions that passed the final test</h1>
        {:else}
            <h1>Statistic for each language:</h1>
            <br>

            {#each [...res] as [language, arrInfo]}
                <h3>{language}</h3>

                <Table bordered>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Real time</th>
                        <th>User time</th>
                        <th>Kernel time</th>
                        <th>Max ram usage</th>
                        <th>Compilation time</th>
                        <th>Binary size</th>
                        <th>Username</th>
                    </tr>
                    </thead>
                    <tbody>

                    {#each arrInfo as info, i}
                        <tr>
                            <th scope="row">{i + 1}</th>
                            <td>{info.real_time} s</td>
                            <td>{info.user_time} s</td>
                            <td>{info.kernel_time} s</td>
                            <td>{info.max_ram_usage} MB</td>
                            <td>{info.compilation_time} s</td>
                            <td>{info.binary_size} MB</td>
                            <td>{info.username}</td>
                        </tr>
                    {/each}

                    </tbody>
                </Table>
                <br>
            {/each}
        {/if}

    {:catch error}
        <p class="error">{error.message}</p>
    {/await}

</div>
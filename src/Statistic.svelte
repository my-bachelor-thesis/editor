<script>
    import {fetchJson} from "./helpers";
    import * as store from "./store"
    import {get} from "svelte/store"
    import {Table} from 'sveltestrap'
    import HelpMessage from "./partial_components/messages/HelpMessage.svelte";
    import {Link} from "svelte-navigator";

    const taskId = new URLSearchParams(window.location.search).get("task-id");
    let url = get(store.url);

    let statisticPromise = fetchJson(`${url}/statistic/${taskId}`)

    let tableContent

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
            <h1>Can't make a statistic, there're no user solutions that passed the final tests</h1>
        {:else}
            <h1>Statistic for each language:
                <HelpMessage imageWidthPercentage="200"
                             text="Statistic consists of the fastest solutions. Each user is included only once per language"/>
            </h1>
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
                        {#if get(store.isAdmin)}
                            <th>Code of solution</th>
                        {/if}
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
                            {#if get(store.isAdmin)}
                                <td>
                                    <Link style="color: grey;" to="/user-solution?id={info.solution_id}">click to show
                                    </Link>
                                </td>
                            {/if}
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
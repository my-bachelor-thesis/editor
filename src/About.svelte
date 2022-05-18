<script lang>
    import {Column, Table} from 'sveltestrap'

    const ROWS = [
        {
            language: "Go",
            version: "1.18"
        },
        {
            language: "Node.js",
            version: "16"
        },
        {
            language: "gcc",
            version: "12.1"
        },
        {
            language: "Python",
            version: "3.10"
        }
    ]
</script>

<div style="text-align: center">
    <h1>About page</h1>
    <br>
    <div style="font-size: x-large">
        This website is a product of my bachelor's thesis.
        You can read more about the thesis <a href="http://www.st.fmph.uniba.sk/~kelemen19/">here</a>
        <br><br>
        Languages used for testing and their versions:
    </div>
    <br><br>
    <Table rows={ROWS} let:row>
        <Column header="Language" width="8rem">
            {row.language}
        </Column>
        <Column header="Version" width="8rem">
            {row.version}
        </Column>
    </Table>
</div>

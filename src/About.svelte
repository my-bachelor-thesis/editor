<script lang>
    import {Column, Table} from 'sveltestrap'

    const ROWS = [
        {
            language: "Go",
            interpreterOrCompiler: "Go 1.18",
            testingFramework: "standard library",
            testCmd: "go test -c main.go main_test.go -o main && main -test.v"
        },
        {
            language: "Javascript",
            interpreterOrCompiler: "Node.js 16",
            testingFramework: "mocha 10",
            testCmd: "mocha --slow 0 --no-colors main.js"
        },
        {
            language: "C++",
            interpreterOrCompiler: "gcc 12.1",
            testingFramework: "catch2 2.13.9",
            testCmd: "g++ -o main main.cpp && main -d yes --use-colour no"
        },
        {
            language: "Python",
            interpreterOrCompiler: "Python 3.10",
            testingFramework: "pytest 7.1.2",
            testCmd: "pytest main.py --durations=0 -vv"
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
        Languages and interpreters/compilers used for testing and their versions:
    </div>
    <br><br>
    <Table rows={ROWS} let:row>
        <Column header="Language" width="8rem">
            {row.language}
        </Column>
        <Column header="Interpreter/compiler" width="8rem">
            {row.interpreterOrCompiler}
        </Column>
        <Column header="Testing framework" width="8rem">
            {row.testingFramework}
        </Column>
        <Column header="Command used for executing user solution" width="8rem">
            <div class="no-wrap">
                {row.testCmd}
            </div>
        </Column>
    </Table>
    <br><br><br>
    Jan Kelemen, 2022
</div>

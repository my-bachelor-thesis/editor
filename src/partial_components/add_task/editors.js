import * as codeExamples from "./code_examples"

class Editors {
    solutions = new Map()
    tests = new Map()
    finalTest
    idOfLastEditor = 1
    languageName = ""
    testExample = ""
    solutionExample = ""

    constructor() {
    }

    reset() {
        this.solutions = new Map()
        this.tests = new Map()
        this.finalTest = undefined
        this.idOfLastEditor = 1
    }
}

class GoEditorsClass extends Editors {
    constructor() {
        super()
        this.languageName = "go"
        this.testExample = codeExamples.goTestExample
        this.solutionExample = codeExamples.goSolutionExample
    }
}

class PythonEditorsClass extends Editors {
    constructor() {
        super()
        this.languageName = "python"
        this.testExample = codeExamples.pythonTestExample
        this.solutionExample = codeExamples.pythonSolutionExample
    }
}

class JavascriptEditorsClass extends Editors {
    constructor() {
        super()
        this.languageName = "javascript"
        this.testExample = codeExamples.javascriptTestExample
        this.solutionExample = codeExamples.javascriptSolutionExample
    }
}

class CppEditorsClass extends Editors {
    constructor() {
        super()
        this.languageName = "cpp"
        this.testExample = codeExamples.cppTestExample
        this.solutionExample = codeExamples.cppSolutionExample
    }
}

export let GoEditors = new GoEditorsClass()
export let PythonEditors = new PythonEditorsClass()
export let JavascriptEditors = new JavascriptEditorsClass()
export let CppEditors = new CppEditorsClass()

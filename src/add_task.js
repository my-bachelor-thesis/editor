class Editors {
    static solutions = new Map()
    static tests = new Map()
    static finalTest
    static idOfLastEditor = 1

    constructor() {
    }

    static reset() {
        this.solutions = new Map()
        this.tests = new Map()
        this.finalTest = undefined
        this.idOfLastEditor = 1
    }
}

export class GoEditors extends Editors {
    constructor() {
        super()
    }
}

export class PythonEditors extends Editors {
    constructor() {
        super()
    }
}

export class JavascriptEditors extends Editors {
    constructor() {
        super()
    }
}

export class CppEditors extends Editors {
    constructor() {
        super()
    }
}

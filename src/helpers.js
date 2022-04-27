import {navigate} from "svelte-navigator"
import * as store from "./store"
import {EditorView, keymap} from "@codemirror/view";
import {basicSetup, EditorState} from "@codemirror/basic-setup";
import {indentWithTab} from "@codemirror/commands";
import {StreamLanguage} from "@codemirror/stream-parser";
import {go} from "@codemirror/legacy-modes/mode/go";
import {python} from "@codemirror/lang-python";

let url = ""
store.url.subscribe(val => {
    url = val
})

export async function fetchJson(url) {
    const res = await fetch(url)
    const data = await res.json()
    if (res.ok) {
        return data
    } else {
        throw new Error(data)
    }
}

export async function postJson(url, content) {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: content
    })

    let data
    try {
        data = await res.json()
    } catch (_) {
    }

    if (res.ok) {
        return data
    }

    if (res.status === 500) {
        data = "internal server error"
    }
    throw new Error(data)
}

export function redirectToHomeWithMessage(msg) {
    if (msg === undefined) {
        navigate(url, {replace: false})
    } else {
        navigate(`${url}?msg=${msg}`, {replace: false})
    }
}

export async function isValidUsername(username) {
    let res = ""
    res = await fetchJson(`${url}/register/is-valid-username/${username}`)
    return res === "true"
}

function parseJwt(token) {
    let base64Url = token.split('.')[1]
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))

    return JSON.parse(jsonPayload)
}

export function setStorage() {
    let token = document.cookie.split("=")[1]
    if (token === undefined || token === "") {
        store.isAdmin.set(false)
        store.username.set("")
        store.userId.set(0)
    } else {
        let parsedToken = parseJwt(token)
        store.isAdmin.set(parsedToken.is_admin)
        store.username.set(parsedToken.username)
        store.userId.set(parsedToken.user_id)
    }
}

export class Editor {
    static #languageToCodemirrorFunction(language) {
        switch (language) {
            case 'go':
                return StreamLanguage.define(go)
            case 'python':
                return python()
        }
    }

    static #newEditor(language, element, ...additionalExtensions) {
        return new EditorView({
            state: EditorState.create({
                extensions: [
                    basicSetup,
                    keymap.of([indentWithTab]),
                    this.#languageToCodemirrorFunction(language),
                    ...additionalExtensions
                ],
            }),
            parent: element,
        })
    }

    static newGoEditor(element, ...additionalExtensions) {
        return this.#newEditor("go", element, ...additionalExtensions)
    }

    static newPythonEditor(element, ...additionalExtensions) {
        return this.#newEditor("python", element, ...additionalExtensions)
    }

    static newEditor(language, element, ...additionalExtensions) {
        switch (language) {
            case 'go':
                return this.newGoEditor(element, ...additionalExtensions)
            case 'python':
                return this.newPythonEditor(element, ...additionalExtensions)
        }
    }
}

export const languages = {
    Go: "go",
    Python: "python",
    Cpp: "cpp"
}

export function languageName(lang) {
    switch (lang) {
        case "go":
            return "Go"
        case "python":
            return "Python"
        case "cpp":
            return "C++"
    }
}

function getIteratorForTransform(obj) {
    let iterator
    if (obj instanceof Map) {
        iterator = obj.entries()
    } else {
        iterator = Object.entries(obj)
    }
    return iterator
}

// solutions can be a map or an object
export function transformSolutionsForSelect(solutions) {
    let res = []

    let iterator = getIteratorForTransform(solutions)

    for (const [id, solution] of iterator) {
        let label = `${solution.name === "" ? "" : solution.name + " - "}${solution.last_modified}${solution.exit_code === 0 ? "" : " ❌ "}${solution.public === true ? "(public)" : ""}`
        res.push({value: id, label: label, exit_code: solution.exit_code, public: solution.public})
    }
    return res
}

// tests can be a map or an object
export function transformTestsForSelect(tests) {
    let res = []

    let iterator = getIteratorForTransform(tests)

    for (const [id, test] of iterator) {
        let label = `${test.name === "" ? "" : test.name + " - "}${test.last_modified}${test.final === true ? " ✔ " : ""}${test.public === true ? "(public)" : ""}`
        res.push({value: id, label: label, final: test.final, pubic: test.public})
    }
    return res
}
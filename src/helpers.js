import {navigate} from "svelte-navigator"
import * as store from "./store"
import {EditorView, keymap} from "@codemirror/view";
import {basicSetup, EditorState} from "@codemirror/basic-setup";
import {indentWithTab} from "@codemirror/commands";
import {StreamLanguage} from "@codemirror/stream-parser";
import {go} from "@codemirror/legacy-modes/mode/go";
import {python} from "@codemirror/lang-python";
import {javascript} from "@codemirror/lang-javascript";
import {cpp} from "@codemirror/lang-cpp";
import {get} from "svelte/store";

let url = ""
store.url.subscribe(val => {
    url = val
})

export async function fetchJson(url, acceptedHttpCodes = []) {
    const res = await fetch(url)
    const data = await res.json()
    if (res.ok) {
        return data
    }
    throw new Error(data)
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
        if (data.message) {
            data = data.message
        }
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
        navigate("home")
    } else {
        navigate(`/?msg=${msg}`)
    }
}

export async function isValidUsername(username) {
    let res = ""
    res = await fetchJson(`${url}/register/is-valid-username/${username}`)
    return res === "true"
}

export async function isValidEmail(email) {
    let res = ""
    res = await fetchJson(`${url}/register/is-valid-email/${email}`)
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

function getCookiesAsMap(cookieString) {
    let cookies = new Map()

    if (cookieString.length > 0) {
        cookieString.split(';').forEach(function (el) {
            let [key, value] = el.split('=')
            cookies.set(key.trim(), value.trim())
        })
    }
    return cookies
}

export function setStorage() {
    let cookies = getCookiesAsMap(document.cookie)

    let auth = cookies.get("auth")
    if (!auth) {
        store.resetUser()
    } else {
        let parsedToken = parseJwt(auth)
        store.isAdmin.set(parsedToken.is_admin)
        store.userId.set(parsedToken.user_id)
        store.username.set(cookies.get("username"))
        store.firstName.set(cookies.get("first_name"))
        store.lastName.set(cookies.get("last_name"))
        store.email.set(cookies.get("email"))
    }
}

export class Editor {
    static #languageToCodemirrorFunction(language) {
        switch (language) {
            case "go":
                return StreamLanguage.define(go)
            case "python":
                return python()
            case "javascript":
                return javascript()
            case "cpp":
                return cpp()
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

    static newEditor(language, element, ...additionalExtensions) {
        switch (language) {
            case 'go':
                return this.#newEditor("go", element, ...additionalExtensions)
            case 'python':
                return this.#newEditor("python", element, ...additionalExtensions)
            case 'javascript':
                return this.#newEditor("javascript", element, ...additionalExtensions)
            case 'cpp':
                return this.#newEditor("cpp", element, ...additionalExtensions)
        }
    }
}

export function languageName(lang) {
    switch (lang) {
        case "go":
            return "Go"
        case "python":
            return "Python"
        case "cpp":
            return "C++"
        case "js":
            return "Javascript"
        case "javascript":
            return "Javascript"
    }
}

function getIteratorForTransform(obj) {
    if (obj instanceof Map) {
        return obj.entries()
    }
    return Object.entries(obj)
}

export function makeSolutionLabel(solution) {
    return `${solution.name === "" ? "" : solution.name + " - "}${solution.last_modified}${solution.is_public ? "🌐" : ""}`
}

// solutions can be a map or an object
export function transformSolutionsForSelect(solutions) {
    let res = []

    let iterator = getIteratorForTransform(solutions)

    for (const [id, solution] of iterator) {
        res.push({
            value: parseInt(id),
            label: makeSolutionLabel(solution),
            public: solution.public,
            name: solution.name,
            last_modified: solution.last_modified,
            test_id: parseInt(solution.test_id)
        })
    }
    return res
}

export function makeTestLabel(test) {
    return `${test.name === "" ? "" : test.name + " - "}${test.last_modified}${test.final ? " ✔ " : ""}${test.public ? "🌐" : ""}`
}

// tests can be a map or an object
export function transformTestsForSelect(tests) {
    let res = []

    let iterator = getIteratorForTransform(tests)

    for (const [id, test] of iterator) {
        res.push({
            value: parseInt(id),
            label: makeTestLabel(test),
            final: test.final,
            public: test.public,
            name: test.name,
            last_modified: test.last_modified
        })
    }
    return res
}

export function redirectIfNotLoggedIn() {
    if (!get(store.username)) {
        navigate("login?msg=Login or Register")
    }
}

export function redirectIfNotAdmin() {
    if (!get(store.username) || !(get(store.isAdmin))) {
        navigate("/?msg=You have to be admin to do that")
    }
}

export function isLanguageInterpreted(lang) {
    return !["go", "cpp"].includes(lang);
}

export function validateEmail(email) {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
}
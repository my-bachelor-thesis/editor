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

    let data = await res.json()

    if (res.ok) {
        return data
    } else {
        if (res.status === 500) {
            data = "internal server error"
        }
        throw new Error(data)
    }
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

export async function waitForElementWithId(id, timeout = 10) {
    timeout *= 1000 // from s to ms
    let start = performance.now();
    while (document.getElementById(id) === null) {
        await new Promise(r => setTimeout(r, 50));
        if (performance.now() - start > timeout) {
            return
        }
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

    static #newEditor(language, element) {
        return new EditorView({
            state: EditorState.create({
                extensions: [basicSetup, keymap.of([indentWithTab]), this.#languageToCodemirrorFunction(language)],
            }),
            parent: element,
        })
    }

    static newGoEditor(element) {
        return this.#newEditor("go", element)
    }

    static newPythonEditor(elementId) {
        return this.#newEditor("python", elementId)
    }
}
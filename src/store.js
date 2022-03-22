import { writable } from 'svelte/store'

export const username = writable("")
export const isAdmin = writable(false)
export const userId = writable(0)
// url in production is baka.jankelemen.net
export const url = writable("http://localhost:9000")
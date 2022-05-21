import {writable} from 'svelte/store'

export const username = writable("")
export const isAdmin = writable(false)
export const userId = writable(0)
export const firstName = writable("")
export const lastName = writable("")
export const email = writable("")
// url in production is baka.jankelemen.net
export const url = writable("http://localhost:9000")

export function resetUser() {
    email.set("")
    username.set("")
    isAdmin.set(false)
    userId.set(0)
    firstName.set("")
    lastName.set("")
}
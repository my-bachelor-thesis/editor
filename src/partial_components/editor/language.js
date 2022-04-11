import { writable } from 'svelte/store'

export class Language {
        static #name = writable("")
        static #isDialogForChangingNameInTestOpened = writable(false) //openTest1Name


    static toggleDialogForChangingNameInTest() {
        this.#isDialogForChangingNameInTestOpened.update(v => !v)
    }

}
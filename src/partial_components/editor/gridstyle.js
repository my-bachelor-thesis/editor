import {get, writable} from 'svelte/store'

export class GridStyleStore {
    static #dividerLength = "10px"
    static #boxLength = "1fr"
    static #boxMinimizedLength = "0fr"
    static #boxes = []
    static gridStyle = writable("")

    static addBoxes(numberOfBoxes) {
        this.setNumberOfBoxes(this.#boxes.length + numberOfBoxes)
    }

    static removeBoxes(numberOfBoxes) {
        return this.setNumberOfBoxes(this.#boxes.length - numberOfBoxes)
    }

    static setNumberOfBoxes(numberOfBoxes) {
        if (numberOfBoxes === this.#boxes.length) {
            return
        }
        this.#boxes = []
        for (let i = 0; i < numberOfBoxes; i++) {
            this.#boxes.push(this.#boxLength)
        }
        this.gridStyle.set(this.toString())
    }

    static minimizeMaximize(index) {
        this.#boxes[index] = this.#boxes[index] === this.#boxLength ? this.#boxMinimizedLength : this.#boxLength
        this.gridStyle.set(this.toString())
    }

    static toString() {
        let res = ""
        for (let i = 0; i < this.#boxes.length; i++) {
            if (i !== this.#boxes.length - 1) {
                res += `${this.#boxes[i]} ${this.#dividerLength} `
            } else {
                res += this.#boxes[i]
            }
        }
        return res
    }

    static isEmpty() {
        return get(this.gridStyle).length === 0
    }

    static subscribe(run) {
        return this.gridStyle.subscribe(run);
    }
}
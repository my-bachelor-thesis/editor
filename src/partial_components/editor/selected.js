import {writable} from 'svelte/store'

class Selected {
    value = writable(undefined)

    subscribe(run) {
        return this.value.subscribe(run)
    }

    set(val) {
        this.value.set(val)
    }
}

export class SelectedSolutionStore extends Selected {
}

export class SelectedTestStore extends Selected {
}
import { readFileSync, writeFileSync } from 'node:fs';

export const Subscribers = new (class {
    #data = new Set<number>(JSON.parse(readFileSync('./subs.json', { encoding: 'utf-8' })));

    get() {
        return this.#data;
    }

    add(newsub: number) {
        if (this.#data.has(newsub)) return;
        else {
            this.#data.add(newsub);
            this.#save();
        }
    }

    delete(delsub: number) {
        if (this.#data.has(delsub)) {
            this.#data.delete(delsub);
            this.#save();
        }
    }

    #save() {
        writeFileSync('./subs.json', JSON.stringify([...this.#data]));
    }
})();

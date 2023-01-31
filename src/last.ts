import { readFileSync, writeFileSync } from 'node:fs';

export type RawLast = {
    date: Date;
    cny2rub: number;
    baht2cny: number;
    rub2baht: number;
    PBcny2rub: number;
};

export type RawLastE = {
    date: Date | undefined;
    cny2rub: number | undefined;
    baht2cny: number | undefined;
    rub2baht: number | undefined;
    PBcny2rub: number | undefined;
};

export class Last {
    #data: RawLast;

    constructor(path: string) {
        const buf = JSON.parse(readFileSync(path, { encoding: 'utf-8' })) as RawLast;
        this.#data = {
            date: new Date(buf.date),
            baht2cny: buf.baht2cny,
            cny2rub: buf.cny2rub,
            rub2baht: buf.rub2baht,
            PBcny2rub: buf.PBcny2rub
        };
        console.log('Loaded last value: ', this.#data);
    }

    get() {
        return this.#data;
    }

    update(last: RawLastE): boolean {
        if (
            (last.baht2cny && last.baht2cny !== this.#data.baht2cny) ||
            (last.cny2rub && last.cny2rub !== this.#data.cny2rub) ||
            (last.date && last.date.getTime() !== this.#data.date.getTime()) ||
            (last.rub2baht && last.rub2baht !== this.#data.rub2baht) ||
            (last.PBcny2rub && last.PBcny2rub !== this.#data.PBcny2rub)
        ) {
            console.log(last.baht2cny && last.baht2cny !== this.#data.baht2cny, last.baht2cny, this.#data.baht2cny);
            console.log(last.cny2rub && last.cny2rub !== this.#data.cny2rub, last.cny2rub, this.#data.cny2rub);
            console.log(last.date && last.date.getTime() !== this.#data.date.getTime(), last.date, this.#data.date);
            console.log(last.rub2baht && last.rub2baht !== this.#data.rub2baht, last.rub2baht, this.#data.rub2baht);
            console.log(last.PBcny2rub && last.PBcny2rub !== this.#data.PBcny2rub, last.PBcny2rub, this.#data.PBcny2rub);
            if (last.PBcny2rub) this.#data.PBcny2rub = last.PBcny2rub;
            if (last.baht2cny) this.#data.baht2cny = last.baht2cny;
            if (last.cny2rub) this.#data.cny2rub = last.cny2rub;
            if (last.date) this.#data.date = last.date;
            if (last.rub2baht) this.#data.rub2baht = last.rub2baht;
            return true;
        } else {
            return false;
        }
    }

    save() {
        writeFileSync(
            './last.json',
            JSON.stringify({
                date: this.#data.date.toISOString().slice(0, 10),
                cny2rub: this.#data.cny2rub,
                baht2cny: this.#data.baht2cny,
                rub2baht: this.#data.rub2baht,
                PBcny2rub: this.#data.PBcny2rub
            })
        );
    }
}

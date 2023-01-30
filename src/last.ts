import { readFileSync, writeFileSync } from 'node:fs';

export type RawLast = {
    date: Date;
    cny2rub: number;
    baht2cny: number;
    rub2baht: number;
    PBcny2rub: number;
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

    update(last: RawLast): boolean {
        // console.log(this.#data);
        // console.log(last);
        // console.log(
        //     last.baht2cny === this.#data.baht2cny,
        //     last.cny2rub === this.#data.cny2rub,
        //     last.date.getTime() === this.#data.date.getTime(),
        //     last.rub2baht === this.#data.rub2baht
        // );
        if (
            last.baht2cny === this.#data.baht2cny &&
            last.cny2rub === this.#data.cny2rub &&
            last.date.getTime() === this.#data.date.getTime() &&
            last.rub2baht === this.#data.rub2baht &&
            last.PBcny2rub === this.#data.PBcny2rub
        ) {
            return false;
        } else {
            this.#data = {
                baht2cny: last.baht2cny,
                cny2rub: last.cny2rub,
                date: last.date,
                rub2baht: last.rub2baht,
                PBcny2rub: last.PBcny2rub
            };
            return true;
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

import { readFileSync, writeFileSync } from 'node:fs';

export type RawLast = {
    date: Date;
    baht2cny: number;
    RScny2rub: number;
    RSrub2baht: number;
    PBcny2rub: number;
    PBrub2baht: number;
    GPcny2rub: number;
    GPrub2baht: number;
};

export type RawLastE = {
    date: Date | undefined;
    baht2cny: number | undefined;
    RScny2rub: number | undefined;
    PBcny2rub: number | undefined;
    GPcny2rub: number | undefined;
};

export class Last {
    #data: RawLast;

    constructor(path: string) {
        const buf = JSON.parse(readFileSync(path, { encoding: 'utf-8' })) as RawLast;
        this.#data = {
            date: new Date(buf.date),
            baht2cny: buf.baht2cny,
            RScny2rub: buf.RScny2rub,
            RSrub2baht: buf.RSrub2baht,
            PBcny2rub: buf.PBcny2rub,
            PBrub2baht: buf.PBrub2baht,
            GPcny2rub: buf.GPcny2rub,
            GPrub2baht: buf.GPrub2baht
        };
        console.log('Loaded last value: ', this.#data);
    }

    get() {
        return this.#data;
    }

    update(last: RawLastE): boolean {
        if (
            (last.baht2cny && last.baht2cny !== this.#data.baht2cny) ||
            (last.date && last.date.getTime() !== this.#data.date.getTime()) ||
            (last.RScny2rub && last.RScny2rub !== this.#data.RScny2rub) ||
            (last.PBcny2rub && last.PBcny2rub !== this.#data.PBcny2rub) ||
            (last.GPcny2rub && last.GPcny2rub !== this.#data.GPcny2rub)
        ) {
            console.log('+'.repeat(60));
            console.log(last.baht2cny && last.baht2cny !== this.#data.baht2cny, last.baht2cny, this.#data.baht2cny);
            console.log(last.date && last.date.getTime() !== this.#data.date.getTime(), last.date, this.#data.date);
            console.log(last.RScny2rub && last.RScny2rub !== this.#data.RScny2rub, last.RScny2rub, this.#data.RScny2rub);
            console.log(last.PBcny2rub && last.PBcny2rub !== this.#data.PBcny2rub, last.PBcny2rub, this.#data.PBcny2rub);
            console.log(last.GPcny2rub && last.GPcny2rub !== this.#data.GPcny2rub, last.GPcny2rub, this.#data.GPcny2rub);
            console.log('+'.repeat(60));
            if (last.PBcny2rub) this.#data.PBcny2rub = last.PBcny2rub;
            if (last.RScny2rub) this.#data.RScny2rub = last.RScny2rub;
            if (last.GPcny2rub) this.#data.GPcny2rub = last.GPcny2rub;
            if (last.baht2cny) this.#data.baht2cny = last.baht2cny;
            if (last.date) this.#data.date = last.date;
            this.#data.RSrub2baht = this.#data.RScny2rub * this.#data.baht2cny;
            this.#data.PBrub2baht = this.#data.PBcny2rub * this.#data.baht2cny;
            this.#data.GPrub2baht = this.#data.GPcny2rub * this.#data.baht2cny;
            return true;
        } else {
            console.log('-'.repeat(60));
            console.log(last.baht2cny && last.baht2cny !== this.#data.baht2cny, last.baht2cny, this.#data.baht2cny);
            console.log(last.date && last.date.getTime() !== this.#data.date.getTime(), last.date, this.#data.date);
            console.log(last.RScny2rub && last.RScny2rub !== this.#data.RScny2rub, last.RScny2rub, this.#data.RScny2rub);
            console.log(last.PBcny2rub && last.PBcny2rub !== this.#data.PBcny2rub, last.PBcny2rub, this.#data.PBcny2rub);
            console.log(last.GPcny2rub && last.GPcny2rub !== this.#data.GPcny2rub, last.GPcny2rub, this.#data.GPcny2rub);
            console.log('-'.repeat(60));
            this.#data.RSrub2baht = this.#data.RScny2rub * this.#data.baht2cny;
            this.#data.PBrub2baht = this.#data.PBcny2rub * this.#data.baht2cny;
            this.#data.GPrub2baht = this.#data.GPcny2rub * this.#data.baht2cny;
            return false;
        }
    }

    save() {
        writeFileSync(
            './last.json',
            JSON.stringify({
                date: this.#data.date.toISOString(),
                RScny2rub: this.#data.RScny2rub,
                baht2cny: this.#data.baht2cny,
                RSrub2baht: this.#data.RSrub2baht,
                PBcny2rub: this.#data.PBcny2rub,
                PBrub2baht: this.#data.PBrub2baht,
                GPcny2rub: this.#data.GPcny2rub,
                GPrub2baht: this.#data.GPrub2baht
            })
        );
    }
}

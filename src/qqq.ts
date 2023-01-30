import { parse, Spec, View } from 'vega';
import { readFileSync, writeFileSync } from 'node:fs';
import { thbX } from './strbuilder';

class DBCl {
    #map: Map<string, { rub2u: number; u2baht: number; baht2ru: number }>;

    constructor() {
        this.#map = new Map<string, { rub2u: number; u2baht: number; baht2ru: number }>();
    }

    readFromCSV = () => {
        const file = readFileSync('./asd.csv', { encoding: 'utf-8' });

        for (const str of file.split('\n')) {
            const day = str.split(';');
            this.#map.set(day[0]!, { baht2ru: Number(day[3]), rub2u: Number(day[2]), u2baht: Number(day[1]) });
        }
    };

    buildValues = (): { date: string; baht2ru: number }[] => {
        const out: { date: string; baht2ru: number }[] = [];

        for (const [day, obj] of this.#map) out.push({ date: day, baht2ru: obj.baht2ru });

        console.log(out);
        return out;
    };

    #bVal = () => {
        const out: { x: number; y: number }[] = [];
        for (let i = 1000; i <= 100000; i += 1000) {
            out.push({ x: i, y: thbX(i) });
        }
        return out;
    };

    buildSpec = (): Spec => {
        const spec: Spec = {
            $schema: 'https://vega.github.io/schema/vega/v5.json',
            description: 'A basic area chart example.',
            width: 960,
            height: 540,

            padding: 5,
            background: 'white',
            data: [
                {
                    name: 'table',
                    values: this.#bVal()
                }
            ],
            scales: [
                {
                    name: 'xscale',
                    type: 'linear',

                    range: 'width',
                    zero: false,
                    domain: { data: 'table', field: 'x' }
                },
                {
                    name: 'yscale',
                    type: 'linear',
                    domainMin: 2,
                    range: 'height',
                    nice: true,
                    // zero: 0,
                    domain: { data: 'table', field: 'y' }
                }
            ],

            axes: [
                {
                    orient: 'bottom',
                    scale: 'xscale',
                    tickCount: 10,
                    format: ',f',
                    labelFlush: undefined,
                    labelOverlap: undefined,
                    title: 'RUB to change',
                    titlePadding: 8,
                    titleAnchor: 'middle',
                    titleBaseline: undefined,
                    titleY: undefined
                },
                {
                    scale: 'yscale',
                    orient: 'right',
                    format: ',f',
                    labelFlush: undefined,
                    labelOverlap: undefined,
                    tickCount: 25,
                    title: 'RUB/THB',
                    titlePadding: 8,
                    titleAnchor: 'middle',
                    titleBaseline: undefined,
                    titleY: undefined,
                    grid: true,
                    offset: 0
                }
            ],

            marks: [
                {
                    type: 'area',
                    from: { data: 'table' },
                    encode: {
                        enter: {
                            x: { scale: 'xscale', field: 'x' },
                            y: { scale: 'yscale', field: 'y' },
                            y2: { scale: 'yscale', value: 2 },
                            fill: { value: 'grey' }
                        },
                        update: {
                            interpolate: { value: 'linear' },
                            fillOpacity: { value: 1 }
                        },
                        hover: {
                            fillOpacity: { value: 0.5 }
                        }
                    }
                }
            ],
            encode: { enter: {} }
        };

        return spec;
    };
}

const DB = new DBCl();

// DB.readFromCSV();

// create a new view instance for a given Vega JSON spec
const view = new View(parse(DB.buildSpec()), { renderer: 'none' });

// generate a static SVG image
view.toSVG()
    .then(function (svg) {
        // process svg string
        console.log(svg);
        writeFileSync('qw.png', Buffer.from(svg));
    })
    .catch(function (err) {
        console.error(err);
    });

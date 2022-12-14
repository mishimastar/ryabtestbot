import { readFileSync, writeFileSync } from 'node:fs';

type rawFlow = {
    [link: string]: [timestamp: number, cost: number, stock: string][];
};

export const Flow = new (class {
    #data = new Map<string, [timestamp: number, cost: number, stock: string][]>();

    init(path: string) {
        const flowRaw = JSON.parse(readFileSync(path, { encoding: 'utf-8' })) as rawFlow;
        for (const [link, flow] of Object.entries(flowRaw)) {
            this.#data.set(link, flow);
        }
    }

    push(url: string, timestamp: number, cost: number, stock: string): string | undefined {
        if (this.#data.has(url)) {
            const flow = this.#data.get(url)!;
            if (flow.length > 0) {
                const previous = flow[flow.length - 1]!;
                this.#data.get(url)!.push([timestamp, cost, stock]);
                // console.log(url, flow, previous);
                if (previous[1] !== cost || previous[2] !== stock) {
                    return `${previous[1]} ₽ ➡ ${cost} ₽\n${previous[2]} ➡ ${stock}\n\n${new Date(previous[0])
                        .toLocaleString()
                        .replaceAll('.', ' ')}\n⬇⬇⬇\n${new Date(timestamp).toLocaleString().replaceAll('.', ' ')}`;
                }
            } else {
                this.#data.get(url)!.push([timestamp, cost, stock]);
                return `NEW FLOW STARTED!\n  ➡ ${cost} ₽\n  ➡ ${stock}\n\n ${new Date(timestamp)
                    .toLocaleString()
                    .replaceAll('.', ' ')}`;
            }
        } else {
            this.#data.set(url, [[timestamp, cost, stock]]);
            return `NEW FLOW STARTED\n  ➡ ${cost} ₽\n  ➡ ${stock}\n\n ${new Date(timestamp)
                .toLocaleString()
                .replaceAll('.', ' ')}`;
        }

        return undefined;
    }

    save() {
        writeFileSync('./flow.json', JSON.stringify(Object.fromEntries(this.#data)));
    }
})();

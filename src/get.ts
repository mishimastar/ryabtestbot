import { get } from 'node:https';
import { parse } from 'node-html-parser';
import { Flow } from './flow';

export const GetPage28 = async (link: string, mode: 'manual' | 'scheduled') => {
    return new Promise<[undefined, boolean] | [string, boolean] | undefined>((resolve, reject) => {
        get(link, function (res) {
            console.log(link, res.statusCode);
            const data: Buffer[] = [];

            res.on('data', (chunk: Buffer) => {
                data.push(chunk);
            });
            res.on('error', (err) => {
                console.error(err);
                reject(err);
            });
            res.on('end', () => {
                const pageRaw = Buffer.concat(data).toString();
                // console.log(pageRaw);
                const page = parse(pageRaw);
                const cart = page.getElementById('product-cart').toString();
                const priceStart = cart.indexOf('<div class="price"');
                const priceClass1 = cart.slice(priceStart, -1);
                const priceClassData = priceClass1.slice(0, priceClass1.indexOf('>'));
                const cost = priceClassData.match(/\d+/);
                // console.log(cost);

                const stockStart = cart.indexOf('class="stock-high product-stock"');
                const stockClass1 = cart.slice(stockStart, -1);
                const stock = stockClass1.slice(stockClass1.indexOf('>') + 1, stockClass1.indexOf('<'));
                // console.log(stock);
                const diff = Flow.push(link, Date.now(), Number(cost!.join('')), stock);
                switch (mode) {
                    case 'scheduled':
                        resolve([diff, false]);
                        break;
                    case 'manual':
                        if (diff) resolve([diff, true]);
                        else resolve([`${cost!.join('')} ₽\n${stock}`, false]);
                        break;
                    default:
                        console.log('bad get mode!!!!');
                        resolve(undefined);
                }
            });
        });
    });
};

export const GetPageKNS = async (link: string, mode: 'manual' | 'scheduled') => {
    return new Promise<[undefined, boolean] | [string, boolean] | undefined>((resolve, reject) => {
        get(
            link,
            {
                headers: {
                    'user-agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36'
                }
            },
            function (res) {
                console.log(link, res.statusCode);
                // console.log(inspect(res.headers));
                const data: Buffer[] = [];

                res.on('data', (chunk: Buffer) => {
                    data.push(chunk);
                });
                res.on('error', (err) => {
                    console.error(err);
                    reject(err);
                });
                res.on('end', () => {
                    const page = Buffer.concat(data).toString();
                    // console.log(pageRaw);
                    const priceStart = page.indexOf('price-val');
                    const priceClass1 = page.slice(priceStart, -1);
                    const priceClassData = priceClass1.slice(priceClass1.indexOf('>') + 1, priceClass1.indexOf('<'));
                    const cost = priceClassData.replaceAll('\t', '').match(/\d+/g);
                    // console.log(cost);

                    const stockStart = page.indexOf('goods-status font-weight-bold mb-4');
                    const stockClass1 = page.slice(stockStart, -1);
                    const stockClass2 = stockClass1.slice(0, stockClass1.indexOf('</div>'));
                    const stock = stockClass2.replaceAll(' ', '').match(/[А-Яа-я]+/g);
                    // console.log(stock);
                    const diff = Flow.push(link, Date.now(), Number(cost!.join('')), stock!.join(' '));
                    switch (mode) {
                        case 'scheduled':
                            resolve([diff, false]);
                            break;
                        case 'manual':
                            if (diff) resolve([diff, true]);
                            else resolve([`${cost!.join('')} ₽\n${stock!.join(' ')}`, false]);
                            break;
                        default:
                            console.log('bad get mode!!!!');
                            resolve(undefined);
                    }
                });
            }
        );
    });
};

export const GetPageRegard = async (link: string, mode: 'manual' | 'scheduled') => {
    return new Promise<[undefined, boolean] | [string, boolean] | undefined>((resolve, reject) => {
        get(
            link,
            {
                headers: {
                    'user-agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36'
                }
            },
            function (res) {
                console.log(link, res.statusCode);
                // console.log(inspect(res.headers));
                const data: Buffer[] = [];

                res.on('data', (chunk: Buffer) => {
                    data.push(chunk);
                });
                res.on('error', (err) => {
                    console.error(err);
                    reject(err);
                });
                res.on('end', () => {
                    const page = Buffer.concat(data).toString();
                    // console.log(pageRaw);
                    const priceStart = page.indexOf('class="PriceBlock_price_');
                    const priceClass1 = page.slice(priceStart, -1);
                    const priceClassData = priceClass1.slice(priceClass1.indexOf('>') + 1, priceClass1.indexOf('<'));
                    const cost = priceClassData.replaceAll(' ', '').match(/\d+/g);
                    // console.log(cost);

                    const stockStart = page.indexOf('class="PriceBlock_inStock');
                    const stockClass1 = page.slice(stockStart, -1);
                    const stock = stockClass1.slice(stockClass1.indexOf('>') + 1, stockClass1.indexOf('<'));
                    // console.log(stock);
                    const diff = Flow.push(link, Date.now(), Number(cost!.join('')), stock);
                    switch (mode) {
                        case 'scheduled':
                            resolve([diff, false]);
                            break;
                        case 'manual':
                            if (diff) resolve([diff, true]);
                            else resolve([`${cost!.join('')} ₽\n${stock}`, false]);
                            break;
                        default:
                            console.log('bad get mode!!!!');
                            resolve(undefined);
                    }
                });
            }
        );
    });
};

import { get } from 'node:https';
import { parse } from 'node-html-parser';

export const GetPage28 = async (link: string) => {
    return new Promise<string>((resolve, reject) => {
        get(link, function (res) {
            console.log(res.statusCode);
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
                resolve(`${cost!.join('')} ₽\n${stock}`);
            });
        });
    });
};

export const GetPageKNS = async (link: string) => {
    return new Promise<string>((resolve, reject) => {
        get(link, function (res) {
            console.log(res.statusCode);
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
                const cost = priceClassData.match(/\d+/);
                console.log(cost);

                const stockStart = page.indexOf('goods-status font-weight-bold mb-4');
                const stockClass1 = page.slice(stockStart, -1);
                const stockClass2 = stockClass1.slice(0, stockClass1.indexOf('</div>'));
                const stock = stockClass2.match(/[А-Яа-я()]+/);
                console.log(stock);
                resolve(`${cost!.join('')} ₽\n${stock}`);
            });
        });
    });
};

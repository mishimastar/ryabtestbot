import { request } from 'node:https';

// export const Rounder = (inp: number) =>
//     String((Math.round(inp / 10 ** (String(inp).length - 1)) + 1) * 10 ** (String(inp).length - 1));

const dataBuilder = (crypto: string, rub: number): { rub2crypto: string; crypto2baht: string } => {
    if (rub < 1000) throw new Error('Min RUB is 1000');

    return {
        rub2crypto: JSON.stringify({
            proMerchantAds: false,
            page: 1,
            rows: 10,
            payTypes: [],
            countries: ['RU'],
            publisherType: null,
            fiat: 'RUB',
            tradeType: 'BUY',
            asset: crypto,
            merchantCheck: false,
            transAmount: rub
        }),
        crypto2baht: JSON.stringify({
            proMerchantAds: false,
            page: 1,
            rows: 10,
            payTypes: ['BANK'],
            countries: [],
            publisherType: null,
            fiat: 'THB',
            tradeType: 'SELL',
            asset: crypto,
            merchantCheck: false,
            transAmount: rub / 2
        })
    };
};
// const usdt2thb = JSON.stringify({
//     proMerchantAds: false,
//     page: 1,
//     rows: 10,
//     payTypes: ['BANK'],
//     countries: [],
//     publisherType: null,
//     fiat: 'THB',
//     tradeType: 'SELL',
//     asset: 'USDT',
//     merchantCheck: false,
//     transAmount: '25000'
// });

// const rub2usdt = JSON.stringify({
//     proMerchantAds: false,
//     page: 1,
//     rows: 10,
//     payTypes: [],
//     countries: ['RU'],
//     publisherType: null,
//     fiat: 'RUB',
//     tradeType: 'BUY',
//     asset: 'USDT',
//     merchantCheck: false,
//     transAmount: '50000'
// });

const getBIN = async (payload: string) => {
    return new Promise<string>((resolve, reject) => {
        const req = request(
            'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',
            {
                method: 'POST',
                headers: {
                    'Accept': '*/*',
                    // 'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'Content-Length': Buffer.byteLength(payload),
                    'content-type': 'application/json',
                    'Host': 'p2p.binance.com',
                    'Origin': 'https://p2p.binance.com',
                    'Pragma': 'no-cache',
                    'TE': 'Trailers',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0'
                }
            },
            (res) => {
                // console.log(`STATUS: ${res.statusCode}`);
                // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
                res.setEncoding('utf8');
                const data: string[] = [];

                res.on('data', (chunk: string) => {
                    data.push(chunk);
                });

                res.on('end', () => {
                    const pageRaw = data.join('');
                    // console.log(pageRaw);
                    const parsed = JSON.parse(pageRaw);
                    // console.log(parsed);
                    if (!parsed.data || parsed.data.length === 0) reject();
                    else resolve(parsed.data[0].adv.price as string);
                    // console.log(inspect(JSON.parse(pageRaw).data));
                });
            }
        );

        req.write(payload);
        req.end();
    });
};

export const GetBIN = async (
    crypto: 'USDT' | 'BTC' | 'BUSD' | 'ETH' | 'DOGE' | string,
    mon: number,
    wal: 'RUB' | 'THB'
) => {
    const { crypto2baht, rub2crypto } = dataBuilder(crypto, wal === 'RUB' ? mon : mon * 2);
    try {
        const r2crypto = Number(await getBIN(rub2crypto));
        const crypto2b = Number(await getBIN(crypto2baht));
        return { r2crypto, crypto2b, rate: r2crypto / crypto2b };
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

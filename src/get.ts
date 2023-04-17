import { get } from 'node:https';

type RSResponce_item = {
    year: string;
    mon: string;
    day: string;
    hour: string;
    min: string;
    rate: number;
    sell: number;
};

export const BuildLinkUP = (date: Date) => {
    return `https://www.unionpayintl.com/upload/jfimg/${date.toISOString().slice(0, 10).replaceAll('-', '')}.json`;
};

export const BuildLinkRS = (date: Date) => {
    return `https://www.rsb.ru/local/ajax/getcoursemass.php?date_start=${date
        .toISOString()
        .slice(0, 10)
        .split('-')
        .reverse()
        .join('.')}&date_end=${date
        .toISOString()
        .slice(0, 10)
        .split('-')
        .reverse()
        .join('.')}&course_type=card_operations&currency=cny`;
};

export const BuildLinkPB = (date: Date) => {
    return `https://www.pochtabank.ru/bxapi/currencies?date=${date.toISOString().slice(0, 10)}`;
};

export const GetUP = async (link: string) => {
    return new Promise<{ date: Date; rate: number } | undefined>((resolve, reject) => {
        get(
            link,
            {
                headers: {
                    'user-agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36'
                }
            },
            function (res) {
                console.log(new Date(), link, res.statusCode);
                if (res.statusCode === 404) {
                    resolve(undefined);
                    return;
                }
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
                    const parsed = JSON.parse(pageRaw);
                    // console.log(parsed);
                    for (const obj of parsed.exchangeRateJson) {
                        if (obj.baseCur === 'CNY' && obj.transCur === 'THB') {
                            resolve({ date: new Date(parsed.curDate), rate: obj.rateData });
                        }
                    }
                    reject();
                });
            }
        );
    });
};

export const GetRS = async (link: string) => {
    return new Promise<{ date: Date; sell: number } | undefined>((r, reject) => {
        get(
            link,
            {
                headers: {
                    'user-agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36'
                }
            },
            function (res) {
                console.log(new Date(), link, res.statusCode);
                if (res.statusCode === 404) {
                    r(undefined);
                    return;
                }
                const data: Buffer[] = [];

                res.on('data', (chunk: Buffer) => {
                    data.push(chunk);
                });
                res.on('error', (err) => {
                    console.error(err);
                    reject(err);
                });
                res.on('end', () => {
                    const pageRaw = Buffer.concat(data)
                        .toString()
                        .replaceAll('(', '')
                        .replaceAll(')', '')
                        .replaceAll(';', '');
                    // console.log(pageRaw);
                    const parsed = JSON.parse(pageRaw);
                    // console.log(parsed);
                    if (!parsed.items || parsed.items.length === 0) reject();
                    const last = parsed.items[parsed.items.length - 1] as RSResponce_item;
                    if (!last.rate || !last.sell) reject();
                    r({ date: new Date(`${last.year}-${last.mon}-${last.day}`), sell: last.sell });
                });
            }
        );
    });
};

export const GetPB = async (link: string) => {
    return new Promise<{ date: Date; sell: number } | undefined>((r, reject) => {
        get(
            link,
            {
                headers: {
                    'user-agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36'
                }
            },
            function (res) {
                console.log(new Date(), link, res.statusCode);
                if (res.statusCode === 404) {
                    r(undefined);
                    return;
                }
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
                    const parsed = JSON.parse(pageRaw);
                    // console.log(parsed);
                    // {"title":"AUD","desc":"\u0410\u0432\u0441\u0442\u0440\u0430\u043b\u0438\u0439\u0441\u043a\u0438\u0439 \u0434\u043e\u043b\u043b\u0430\u0440","buy":{"value":46.3212,"flag":false,"difference":0},"sale":{"value":52.2346,"flag":false,"difference":0}}
                    if (!parsed.data || parsed.data.length === 0) reject();

                    for (const val of parsed.data) {
                        if (val.title === 'CNY') {
                            // console.log(val);
                            r({ date: new Date(link.slice(48)), sell: val.sale.value });
                        }
                    }
                });
            }
        );
    });
};

// export const GetGP = async () => {
//     const link = 'https://www.gazprombank.ru/rest/exchange/rate?cityId=617&version=3&ab_version=new';
//     return new Promise<{ date: Date; sell: number } | undefined>((r, reject) => {
//         get(
//             link,
//             {
//                 headers: {
//                     'user-agent':
//                         'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36'
//                 }
//             },
//             function (res) {
//                 console.log(new Date(), link, res.statusCode);
//                 if (res.statusCode === 404) {
//                     r(undefined);
//                     return;
//                 }
//                 const data: Buffer[] = [];

//                 res.on('data', (chunk: Buffer) => {
//                     data.push(chunk);
//                 });
//                 res.on('error', (err) => {
//                     console.error(err);
//                     reject(err);
//                 });
//                 res.on('end', () => {
//                     const pageRaw = Buffer.concat(data).toString();
//                     // console.log(pageRaw);
//                     const parsed = JSON.parse(pageRaw);
//                     // console.log(parsed);
//                     if (!parsed || parsed.length === 0) reject();

//                     for (const obj of parsed) {
//                         if (obj.code === 'exchange_rates_internet_bank') {
//                             for (const cont of obj.content) {
//                                 if (!cont.items || cont.items.length === 0) reject();
//                                 for (const item of cont.items)
//                                     if (item.ticker === 'CNY') {
//                                         console.log({
//                                             date: new Date(cont.updated.slice(-10).split('.').reverse().join('-')),
//                                             sell: Number(item.sell)
//                                         });
//                                         r({
//                                             date: new Date(cont.updated.slice(-10).split('.').reverse().join('-')),
//                                             sell: Number(item.sell)
//                                         });
//                                     }
//                             }
//                         }
//                     }
//                     reject();
//                 });
//             }
//         );
//     });
// };

// export const GetRSHB = async () => {
//     const link = 'https://www.rshb.ru/natural/cards/rates/rates_online/';
//     return new Promise<{ date: Date; sell: number } | undefined>((r, reject) => {
//         get(
//             link,
//             {
//                 headers: {
//                     'user-agent':
//                         'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36'
//                 }
//             },
//             function (res) {
//                 console.log(new Date(), link, res.statusCode);
//                 if (res.statusCode === 404) {
//                     r(undefined);
//                     return;
//                 }
//                 const data: Buffer[] = [];

//                 res.on('data', (chunk: Buffer) => {
//                     data.push(chunk);
//                 });
//                 res.on('error', (err) => {
//                     console.error(err);
//                     reject(err);
//                 });
//                 res.on('end', () => {
//                     const pageRaw = Buffer.concat(data).toString();
//                     // console.log(pageRaw);

//                     const first = pageRaw.indexOf('CNY/RUR');
//                     if (first < 0) reject();
//                     const target = pageRaw
//                         .slice(first, first + 100)
//                         .replaceAll(' ', '')
//                         .replaceAll('\n', '')
//                         .slice(32, 39);
//                     // if (first >= 0) console.log(target);
//                     r({ sell: Number(target), date: new Date(0) });
//                 });
//             }
//         );
//     });
// };

// // https://www.rshb.ru/natural/cards/rates/rates_online/?date_from=31.01.2023
// // https://www.rshb.ru/natural/cards/rates/rates_online/?date_from=31.01.2023&date_to=31.01.2023
// // CNY/RUR

// // GetRSHB().catch((e) => console.error(e));

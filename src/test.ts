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

import TelegramBot from 'node-telegram-bot-api';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';
import { Subscribers } from './subscribers';
import { Last } from './last';
import { setTimeout as stopFlow } from 'node:timers/promises';
import { BuildLinkPB, BuildLinkRS, BuildLinkUP, GetPB, GetRS, GetUP } from './get';
import { BuildRUBTHB, BuildTHBRUB } from './strbuilder';

const token = readFileSync('./.token', { encoding: 'utf-8' }).trim();
export const LastData = new Last('./last.json');

// const revert = (str: string) => str.split('').reverse().join('');

const start = async () => {
    const bot = new TelegramBot(token, { polling: true });

    console.log('Starting bot!', new Date());

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    bot.onText(/\/echo (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (match) {
            const resp = match[1]!; // the captured "whatever"
            if (resp) await bot.sendMessage(chatId, resp);
        } else {
            await bot.sendMessage(chatId, 'error');
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    bot.onText(/^\/start/, async (msg) => {
        console.log(msg.chat.id);
        const chatId = msg.chat.id;

        await bot.sendMessage(
            chatId,
            'Привет, отправь мне число и имя валюты, например:\n10000 бат\n300 bath\n 248 b\n 50 000 рублей\n12300 р\nруб 8000'
        );
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    bot.onText(/(baht)|( b)|(бат)|( б)|(^b)|(^б)/, async (msg) => {
        console.log(msg.chat.id, 'BAHT');
        let str = '';
        for (const symbol of msg.text!) if (/(\d)|(\.)/.test(symbol)) str += symbol;

        const responce = BuildTHBRUB(str);
        if (responce) {
            await bot.sendMessage(msg.chat.id, responce, { reply_to_message_id: msg.message_id, parse_mode: 'MarkdownV2' });
        } else {
            await bot.sendMessage(msg.chat.id, 'пахнет батами, но ты что-то бредишь', {
                reply_to_message_id: msg.message_id
            });
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    bot.onText(/(rub)|(r)|(руб)|(р)/, async (msg) => {
        console.log(msg.chat.id, 'RUB');
        let str = '';
        for (const symbol of msg.text!) if (/(\d)|(\.)/.test(symbol)) str += symbol;

        const responce = BuildRUBTHB(str);
        if (responce) {
            await bot.sendMessage(msg.chat.id, responce, { reply_to_message_id: msg.message_id, parse_mode: 'MarkdownV2' });
        } else {
            await bot.sendMessage(msg.chat.id, 'пахнет рублями, но ты что-то бредишь', {
                reply_to_message_id: msg.message_id
            });
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(async () => {
        try {
            const d = new Date();
            const rsb = await GetRS(BuildLinkRS(d));
            // console.log('RSB', rsb);
            if (!rsb) throw new Error('Cant fetch RSB');
            const pb = await GetPB(BuildLinkPB(d));
            // console.log('PB', pb);
            if (!pb) throw new Error('Cant fetch PB');

            const up = await GetUP(BuildLinkUP(d));
            // console.log('UP', up);
            if (!up) throw new Error('Cant fetch UP');

            if (
                LastData.update({
                    date: up.date,
                    baht2cny: up.rate,
                    cny2rub: rsb.sell,
                    rub2baht: up.rate * rsb.sell,
                    PBcny2rub: pb.sell
                })
            ) {
                LastData.save();
                for (const subscriber of Subscribers) {
                    await bot.sendMessage(
                        subscriber,
                        `Bot is online at now\\!\nSubscribers: ${
                            Subscribers.size
                        }\n\nОбновление курса:\nUnionPay: 1 **THB** ➡️ **${
                            up.rate
                        }** **CNY*\n\n*РУССКИЙ СТАНДАРТ\n1 **CNY** ➡️ **${rsb.sell}** **RUB**\n1 **THB** ➡️ **${(
                            rsb.sell * up.rate
                        ).toFixed(6)}** **RUB**\n\nПОЧТА БАНК\n1 **CNY** ➡️ **${pb.sell}** **RUB**\n1 **THB** ➡️ **${(
                            pb.sell * up.rate
                        ).toFixed(6)}** **RUB**\n\n${new Date().toLocaleString().replaceAll('.', ' ')}`.replaceAll(
                            '.',
                            '\\.'
                        ),
                        { parse_mode: 'MarkdownV2' }
                    );
                    await stopFlow(300);
                }
            } else {
                await bot.sendMessage(
                    857880458,
                    `Bot is online at now!\nSubscribers: ${Subscribers.size}\n\n${new Date()
                        .toLocaleString()
                        .replaceAll('.', ' ')}`
                );
            }
        } catch (error) {
            console.error(error);
            await bot.sendMessage(857880458, String(error).replaceAll('.', ' '));
        }
    }, 1000);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setInterval(async () => {
        try {
            const d = new Date();
            const rsb = await GetRS(BuildLinkRS(d));
            // console.log('RSB', rsb);
            if (!rsb) throw new Error('Cant fetch RSB');
            const pb = await GetPB(BuildLinkPB(d));
            // console.log('PB', pb);
            if (!pb) throw new Error('Cant fetch PB');

            const up = await GetUP(BuildLinkUP(d));
            // console.log('UP', up);
            if (!up) throw new Error('Cant fetch UP');

            if (
                LastData.update({
                    date: up.date,
                    baht2cny: up.rate,
                    cny2rub: rsb.sell,
                    rub2baht: up.rate * rsb.sell,
                    PBcny2rub: pb.sell
                })
            ) {
                LastData.save();
                for (const subscriber of Subscribers) {
                    await bot.sendMessage(
                        subscriber,
                        `Обновление курса:\nUnionPay: 1 **THB** ➡️ **${
                            up.rate
                        }** **CNY*\n\n*РУССКИЙ СТАНДАРТ\n1 **CNY** ➡️ **${rsb.sell}** **RUB**\n1 **THB** ➡️ **${(
                            rsb.sell * up.rate
                        ).toFixed(6)}** **RUB**\n\nПОЧТА БАНК\n1 **CNY** ➡️ **${pb.sell}** **RUB**\n1 **THB** ➡️ **${(
                            pb.sell * up.rate
                        ).toFixed(6)}** **RUB**\n\n${new Date().toLocaleString().replaceAll('.', ' ')}`.replaceAll(
                            '.',
                            '\\.'
                        ),
                        { parse_mode: 'MarkdownV2' }
                    );
                    await stopFlow(300);
                }
            } else {
                await bot.sendMessage(857880458, 'Запросы выполнены, изменений нет');
            }
        } catch (error) {
            console.error(error);
            await bot.sendMessage(857880458, String(error).replaceAll('.', ' '));
        }
    }, 60000);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    // bot.on('message', async (msg) => {
    //     const chatId = msg.chat.id;
    //     console.log(chatId);
    //     if (msg.text) await bot.sendMessage(chatId, revert(msg.text ?? ''));
    // });

    await Promise.race([once(process, 'SIGINT'), once(process, 'SIGTERM')]);

    for (const subscriber of Subscribers)
        await bot.sendMessage(
            subscriber,
            `Bot is going offline at now\n\nКурс *1 THB* \\= *${LastData.get().rub2baht.toFixed(6)} RUB*`.replaceAll(
                '.',
                '\\.'
            ),
            { parse_mode: 'MarkdownV2' }
        );

    await bot.stopPolling();

    await bot.close();
    console.log('Bot Stopped', new Date());
};

start().catch((e) => {
    console.error('ryabparsetestbot: fatal error', { error: JSON.stringify(e) });
    process.exit(1);
});

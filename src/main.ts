import TelegramBot from 'node-telegram-bot-api';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';
import { Subscribers } from './subscribers';
import { Last } from './last';
import { setTimeout as stopFlow } from 'node:timers/promises';
import { BuildLinkPB, BuildLinkRS, BuildLinkUP, GetPB, GetRS, GetUP } from './get';
import { BuildRUBTHB, BuildTHBRUB, ByeByeRates, RateUpdate } from './strbuilder';

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
            'Привет, отправь мне количество и имя валюты, например:\n`10000 бат`\n`300 bath`\n`248 b`\n`50 000 рублей`\n`12300 р`\n`руб 8000`',
            { parse_mode: 'MarkdownV2' }
        );
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    bot.onText(/(baht)|( b)|(бат)|( б)|(^b)|(^б)|(thb)|( t)|( th)|(THB)|(B)|(T)|(Б)|(Т)/, async (msg) => {
        console.log(msg.chat.id, 'BAHT');
        let str = '';
        for (const symbol of msg.text!) if (/(\d)|(\.)/.test(symbol)) str += symbol;

        const responces = BuildTHBRUB(str);
        console.log(responces);
        if (responces) {
            for (const responce of responces)
                await bot.sendMessage(msg.chat.id, responce, {
                    reply_to_message_id: msg.message_id,
                    parse_mode: 'MarkdownV2'
                });
        } else {
            await bot.sendMessage(msg.chat.id, 'пахнет батами, но ты что-то бредишь', {
                reply_to_message_id: msg.message_id
            });
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    bot.onText(/(rub)|( r)|(руб)|(р)|(RUB)|(R)|(Р)/, async (msg) => {
        console.log(msg.chat.id, 'RUB');
        let str = '';
        for (const symbol of msg.text!) if (/(\d)|(\.)/.test(symbol)) str += symbol;

        const responces = BuildRUBTHB(str);
        console.log(responces);
        if (responces) {
            for (const responce of responces)
                await bot.sendMessage(msg.chat.id, responce, {
                    reply_to_message_id: msg.message_id,
                    parse_mode: 'MarkdownV2'
                });
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
            const pb = await GetPB(BuildLinkPB(d));
            const up = await GetUP(BuildLinkUP(d));

            let dateC: Date = LastData.get().date;
            if (rsb?.date && rsb.date > dateC) dateC = rsb.date;
            if (pb?.date && pb.date > dateC) dateC = pb.date;
            if (up?.date && up.date > dateC) dateC = up.date;

            if (
                LastData.update({
                    date: dateC,
                    baht2cny: up?.rate,
                    RScny2rub: rsb?.sell,
                    PBcny2rub: pb?.sell
                })
            ) {
                LastData.save();
                for (const subscriber of Subscribers) {
                    await bot.sendMessage(
                        subscriber,
                        `Bot is online at now\\!\nSubscribers: ${Subscribers.size}\n\n${RateUpdate()}`,
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
            await bot.sendMessage(857880458, 'Ошибка');
        }
    }, 1000);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setInterval(async () => {
        try {
            const d = new Date();
            const rsb = await GetRS(BuildLinkRS(d));
            const pb = await GetPB(BuildLinkPB(d));
            const up = await GetUP(BuildLinkUP(d));

            let dateC: Date = LastData.get().date;
            if (rsb?.date && rsb.date > dateC) dateC = rsb.date;
            if (pb?.date && pb.date > dateC) dateC = pb.date;
            if (up?.date && up.date > dateC) dateC = up.date;

            if (
                LastData.update({
                    date: dateC,
                    baht2cny: up?.rate,
                    RScny2rub: rsb?.sell,
                    PBcny2rub: pb?.sell
                })
            ) {
                LastData.save();
                for (const subscriber of Subscribers) {
                    await bot.sendMessage(subscriber, RateUpdate(), { parse_mode: 'MarkdownV2' });
                    await stopFlow(300);
                }
            } else {
                await bot.sendMessage(857880458, 'Запросы выполнены, изменений нет', { disable_notification: true });
            }
        } catch (error) {
            console.error(error);
            await bot.sendMessage(857880458, 'ошибка');
        }
    }, 3600000);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    // bot.on('message', async (msg) => {
    //     const chatId = msg.chat.id;
    //     console.log(chatId);
    //     if (msg.text) await bot.sendMessage(chatId, revert(msg.text ?? ''));
    // });

    await Promise.race([once(process, 'SIGINT'), once(process, 'SIGTERM')]);

    // await bot.sendMessage(857880458, `Bot is going offline at now\n\n${ByeByeRates()}`, {
    //     parse_mode: 'MarkdownV2'
    // });

    for (const subscriber of Subscribers)
        await bot.sendMessage(subscriber, `Bot is going offline at now\n\n${ByeByeRates()}`, { parse_mode: 'MarkdownV2' });

    await bot.stopPolling();

    await bot.close();
    console.log('Bot Stopped', new Date());
};

start().catch((e) => {
    console.error('ryabparsetestbot: fatal error', { error: JSON.stringify(e) });
    process.exit(1);
});

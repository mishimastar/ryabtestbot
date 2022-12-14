import TelegramBot from 'node-telegram-bot-api';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';
import { Flow } from './flow';
import { Links } from './links';
import { Subscribers } from './subscribers';

const token = readFileSync('./.token', { encoding: 'utf-8' });
Flow.init('./flow.json');

const start = async () => {
    const bot = new TelegramBot(token, { polling: true });

    console.log('Starting bot!', new Date());

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    bot.onText(/\/echo (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (match) {
            const resp = match[1]!; // the captured "whatever"
            await bot.sendMessage(chatId, resp);
        } else {
            await bot.sendMessage(chatId, 'error');
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(async () => {
        for (const subscriber of Subscribers)
            await bot.sendMessage(
                subscriber,
                `Bot is online at now!\nSubscribers: ${Subscribers.size}\n\n${new Date()
                    .toLocaleString()
                    .replaceAll('.', ' ')}`
            );
    }, 1000);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setInterval(async () => {
        for (const [shopName, query] of Object.entries(Links)) {
            let out = '';
            for (const [lotName, link] of query.links) {
                try {
                    const resp = await query.get(link, 'scheduled');
                    if (resp && resp[0]) out += `[${lotName}](${link})\n${resp[0]}\n\n`;
                } catch (error) {
                    out += `[${lotName}](${link})\nОШИБКА ЗАПРОСА, СМОТРИ ЛОГИ\n\n`;
                }
            }
            if (out.length > 0) {
                const message = `${shopName}\n\n${out}`;
                for (const subscriber of Subscribers)
                    await bot.sendMessage(subscriber, message, {
                        parse_mode: 'MarkdownV2',
                        disable_web_page_preview: true
                    });
            }
        }
        Flow.save();
    }, 600000);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        console.log(chatId);
        // send a message to the chat acknowledging receipt of their message
        await bot.sendMessage(chatId, 'Ответ по запросу:');
        for (const [shopName, query] of Object.entries(Links)) {
            let sendToAll = false;
            let out = `${shopName}\n\n`;
            for (const [lotName, link] of query.links) {
                try {
                    const resp = await query.get(link, 'manual');
                    if (resp![1]) sendToAll = true;
                    out += `[${lotName}](${link})\n${resp![0]!}\n\n`;
                } catch (error) {
                    out += `[${lotName}](${link})\nОШИБКА ЗАПРОСА, СМОТРИ ЛОГИ\n\n`;
                }
            }
            if (sendToAll) {
                for (const subscriber of Subscribers) {
                    console.log('Sent notification to ', subscriber);
                    await bot.sendMessage(subscriber, out, { parse_mode: 'MarkdownV2', disable_web_page_preview: true });
                }
            } else {
                out += new Date().toLocaleString().replaceAll('.', ' ');
                await bot.sendMessage(chatId, out, { parse_mode: 'MarkdownV2', disable_web_page_preview: true });
            }
        }
        Flow.save();
    });

    await Promise.race([once(process, 'SIGINT'), once(process, 'SIGTERM')]);

    for (const subscriber of Subscribers)
        await bot.sendMessage(subscriber, 'Bot is going offline at now', { parse_mode: 'MarkdownV2' });

    await bot.stopPolling();

    await bot.close();
    console.log('Bot Stopped', new Date());
};

start().catch((e) => {
    console.error('ryabparsetestbot: fatal error', e);
    process.exit(1);
});

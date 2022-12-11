import TelegramBot from 'node-telegram-bot-api';
import { Links } from './links';
import { Subscribers } from './subscribers';

const token = '';

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    if (match) {
        const resp = match[1]!; // the captured "whatever"
        void bot.sendMessage(chatId, resp);
    } else {
        void bot.sendMessage(chatId, 'error');
    }
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
setTimeout(async () => {
    for (const subscriber of Subscribers)
        await bot.sendMessage(
            subscriber,
            `Bot is online at now!\nSubscribers: ${Subscribers.size}\n\n${new Date().toLocaleString().replaceAll('.', ' ')}`
        );
}, 1000);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
setInterval(async () => {
    for (const [shopName, query] of Object.entries(Links)) {
        let out = `${shopName}\n\n`;
        for (const [lotName, link] of query.links) {
            out += `[${lotName}](${link})\n${await query.get(link)}\n\n`;
        }
        out += new Date().toLocaleString().replaceAll('.', ' ');
        for (const subscriber of Subscribers)
            void bot.sendMessage(subscriber, out, { parse_mode: 'MarkdownV2', disable_web_page_preview: true });
    }
}, 900000);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    console.log(chatId);
    // send a message to the chat acknowledging receipt of their message
    void bot.sendMessage(chatId, 'Received your message');
    for (const [shopName, query] of Object.entries(Links)) {
        let out = `${shopName}\n\n`;
        for (const [lotName, link] of query.links) {
            out += `[${lotName}](${link})\n${await query.get(link)}\n\n`;
        }
        out += new Date().toLocaleString().replaceAll('.', ' ');
        void bot.sendMessage(chatId, out, { parse_mode: 'MarkdownV2', disable_web_page_preview: true });
    }
});

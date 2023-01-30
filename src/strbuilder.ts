import { LastData } from './main';

const parseNum = (inp: string): number | undefined => {
    try {
        const out = Number(inp);
        return out ? out : undefined;
    } catch (error) {
        console.log(error);
        return undefined;
    }
};

export const thbX = (thb: number) => {
    const percent = (thb + 220) * LastData.get().rub2baht * 0.02 > 100 ? (thb + 220) * LastData.get().rub2baht * 0.02 : 100;
    const rub = (thb + 220) * LastData.get().rub2baht + percent;
    return rub / thb;
};

export const BuildRUBTHB = (inp: string): string | undefined => {
    const parsed = parseNum(inp);
    if (!parsed) return undefined;

    const naked = parsed / LastData.get().rub2baht;
    if (naked < 220)
        return `РУССКИЙ СТАРДАРТ\n\nБез учета комиссий:\nКурс *1 THB* \\= *${
            LastData.get().rub2baht
        } RUB*\n${parsed.toFixed()} RUB ➡️ *${naked.toFixed(
            2
        )} THB*\n\n**С учетом комиссии снятие не возможно\\!**\nМинимальная сумма, чтобы снять 20 THB \\= **${
            240 * LastData.get().rub2baht +
            (240 * LastData.get().rub2baht * 0.02 > 100 ? 240 * LastData.get().rub2baht * 0.02 : 100)
        } RUB**`
            .replaceAll('.', '\\.')
            .replaceAll('-', '\\-');

    const percent = parsed * 0.02 > 100 ? parsed * 0.02 : 100;
    const full = (parsed + percent) / LastData.get().rub2baht;

    return `РУССКИЙ СТАРДАРТ\n\nБез учета комиссий:\nКурс *1 THB* \\= *${
        LastData.get().rub2baht
    } RUB*\n${parsed.toFixed()} RUB ➡️ *${naked.toFixed(
        2
    )} THB*\n\nКомиссия РСБ 2% \\(минимум 100 ₽\\) и 220 бат:\n*Курс 1 THB \\= ${(parsed / (full - 220)).toFixed(
        6
    )} RUB*\n${parsed.toFixed(2)} \\+ ${percent.toFixed(2)} RUB ➡️ ***${(parsed / LastData.get().rub2baht - 220).toFixed(
        2
    )}*** THB`
        .replaceAll('.', '\\.')
        .replaceAll('-', '\\-');
};

export const BuildTHBRUB = (inp: string): string | undefined => {
    const parsed = parseNum(inp);
    if (!parsed) return undefined;

    const naked = parsed * LastData.get().rub2baht;

    const fullbaht = parsed + 220;
    const percent = fullbaht * LastData.get().rub2baht * 0.02 > 100 ? fullbaht * LastData.get().rub2baht * 0.02 : 100;
    const full = fullbaht * LastData.get().rub2baht + percent;

    return `РУССКИЙ СТАРДАРТ\n\nБез учета комиссий:\nКурс *1 THB* \\= *${
        LastData.get().rub2baht
    } RUB*\n${parsed.toFixed()} THB ➡️ *${naked.toFixed(
        2
    )} RUB*\n\nКомиссия РСБ 2% \\(минимум 100 ₽\\) и 220 бат:\n*Курс 1 THB \\= ${(full / parsed).toFixed(
        6
    )} RUB*\n${parsed.toFixed(2)} \\+  220 THB ➡️ ***${full.toFixed(2)}*** RUB`
        .replaceAll('.', '\\.')
        .replaceAll('-', '\\-');
};

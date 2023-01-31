import { Banks } from './banks';
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

export const RateUpdate = () => {
    return `Обновление курса:\nUnionPay: 1 **THB** ➡️ **${
        LastData.get().baht2cny
    }** **CNY*\n\n*РУССКИЙ СТАНДАРТ\n1 **CNY** ➡️ **${
        LastData.get().RScny2rub
    }** **RUB**\n1 **THB** ➡️ **${LastData.get().RSrub2baht.toFixed(6)}** **RUB**\n\nПОЧТА БАНК\n1 **CNY** ➡️ **${
        LastData.get().PBcny2rub
    }** **RUB**\n1 **THB** ➡️ **${(LastData.get().PBcny2rub * LastData.get().baht2cny).toFixed(6)}** **RUB**\n\n${new Date()
        .toLocaleString()
        .replaceAll('.', ' ')}`.replaceAll('.', '\\.');
};

export const THB2RUBRate = (thb: number, rate: number, p: number, min: number) => {
    const percent = (thb + 220) * rate * p > min ? (thb + 220) * rate * p : min;
    const rub = (thb + 220) * rate + percent;
    return rub / thb;
};

const FairyTailRateRUB = (rub: number, rate: number) =>
    `Без учета комиссий:\nКурс *1 THB* \\= *${rate.toFixed(6)} RUB*\n${rub.toFixed(2)} RUB ➡️ *${(rub / rate).toFixed(
        2
    )} THB*`;
const FairyTailRateTHB = (thb: number, rate: number) =>
    `Без учета комиссий:\nКурс *1 THB* \\= *${rate.toFixed(6)} RUB*\n${thb.toFixed(2)} THB ➡️ *${(thb * rate).toFixed(
        2
    )} RUB*`;

const RealRateRUB = (rub: number, rate: number, p: number, min: number) => {
    const percent = rub * p > min ? rub * p : min;
    if (rub < percent) return `**С учетом комиссии снятие не возможно\\!**Минимальная комиссия банка ${min} RUB`;
    else if ((rub - percent) / rate > 220) {
        const full = (rub + percent) / rate;
        return `Комиссия ${p * 100}% \\(минимум ${min} ₽\\) и 220 бат:\n*Курс 1 THB \\= ${(
            (rub - percent) /
            (full - 220)
        ).toFixed(6)} RUB*\n${rub.toFixed(2)} __- ${percent.toFixed(2)}__ RUB ➡️ ***${(rub / rate - 220).toFixed(
            2
        )}*** THB`;
    } else {
        return `**С учетом комиссии снятие не возможно\\!**\nМинимальная сумма, чтобы снять 20 THB \\= **${
            240 * rate + (240 * rate * p > min ? 240 * rate * p : min)
        } RUB**`;
    }
};
const RealRateTHB = (thb: number, rate: number, p: number, min: number) => {
    const fullbaht = thb + 220;
    const percent = fullbaht * rate * p > min ? fullbaht * rate * p : min;
    const full = fullbaht * rate + percent;

    return `Комиссия ${p * 100}% \\(минимум ${min} ₽\\) и 220 бат:\n*Курс 1 THB \\= ${(full / thb).toFixed(
        6
    )} RUB*\n${thb.toFixed(2)} __\\+  220__ THB ➡️ ***${full.toFixed(2)}*** RUB`;
};

export const SingleBankRUB = (name: string, rub: number) => {
    const aboutBank = Banks.get(name)!;
    const rate = LastData.get()[aboutBank.rateName];
    console.log(aboutBank, rate);
    return `${name}\n\n${FairyTailRateRUB(rub, rate)}\n\n${RealRateRUB(rub, rate, aboutBank.percent, aboutBank.min)}`
        .replaceAll('.', '\\.')
        .replaceAll('-', '\\-');
};

export const SingleBankTHB = (name: string, thb: number) => {
    const aboutBank = Banks.get(name)!;
    const rate = LastData.get()[aboutBank.rateName];
    console.log(aboutBank, rate);
    return `${name}\n\n${FairyTailRateTHB(thb, rate)}\n\n${RealRateTHB(thb, rate, aboutBank.percent, aboutBank.min)}`
        .replaceAll('.', '\\.')
        .replaceAll('-', '\\-');
};

export const BuildRUBTHB = (inp: string): string[] | undefined => {
    const parsed = parseNum(inp);
    if (!parsed) return undefined;
    const out: string[] = [];
    for (const bank of Banks.keys()) out.push(SingleBankRUB(bank, parsed));
    return out;
};

export const BuildTHBRUB = (inp: string): string[] | undefined => {
    const parsed = parseNum(inp);
    if (!parsed) return undefined;
    const out: string[] = [];
    for (const bank of Banks.keys()) out.push(SingleBankTHB(bank, parsed));
    return out;
};

export const ByeByeRates = () => {
    let out = '';
    for (const [bank, aboutBank] of Banks) {
        out += `${bank}\n1 THB \\= ${LastData.get()[aboutBank.rateName].toFixed(6)} **RUB**\n\n`;
    }
    return out.replaceAll('.', '\\.');
};

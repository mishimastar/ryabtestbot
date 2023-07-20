export const Banks = new Map<string, { percent: number; min: number; rateName: 'RSrub2baht' }>([
    ['РУССКИЙ СТАНДАРТ БАНК', { min: 100, percent: 0.02, rateName: 'RSrub2baht' }]
    // ['ПОЧТА БАНК', { min: 300, percent: 0.01, rateName: 'PBrub2baht' }]
    // ['ГАЗПРОМ БАНК', { min: 200, percent: 0.015, rateName: 'GPrub2baht' }],
    // ['РОССЕЛЬХОЗ БАНК', { min: 199, percent: 0.01, rateName: 'RSHBrub2baht' }]
]);

export const Crypto = new Set<string>(['USDT', 'BTC', 'BUSD', 'ETH', 'DOGE']);

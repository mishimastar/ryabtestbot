export const Banks = new Map<
    string,
    { percent: number; min: number; rateName: 'RSrub2baht' | 'PBrub2baht' | 'GPrub2baht' }
>([
    ['РУССКИЙ СТАНДАРТ БАНК', { min: 100, percent: 0.02, rateName: 'RSrub2baht' }],
    ['ПОЧТА БАНК', { min: 300, percent: 0.01, rateName: 'PBrub2baht' }],
    ['ГАЗПРОМ БАНК', { min: 200, percent: 0.015, rateName: 'GPrub2baht' }]
]);

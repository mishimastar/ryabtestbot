import { GetPage28 } from './get';

export const Links = {
    '28bit': {
        links: new Map([
            [
                'Видеокарта MSI Radeon RX 6950 XT 16GB GAMING X TRIO',
                'https://28bit.ru/videokarta-msi-rx6950xt-gaming-x-trio-radeon-rx-6950-xt-16gb-gaming-x-trio/'
            ]
            // ,
            // [
            //     'Видеокарта Colorful GeForce RTX 4090 24GB NB EX V',
            //     'https://28bit.ru/videokarta-colorful-rtx-4090-nb-ex-v-geforce-rtx-4090-24gb-nb-ex-v/'
            // ]
        ]),
        get: GetPage28
    }
    // KNS: {
    //     links: new Map([
    //         [
    //             'Видеокарта MSI AMD Radeon RX 6950 XT Gaming X Trio 16G',
    //             'https://kns.ru/product/videokarta-msi-amd-radeon-rx-6950-xt-gaming-x-trio-16g/'
    //         ]
    //     ]),
    // get: GetPageKNS
    // }
};


const BSC_MASTER_APE = 'https://bscscan.com/address/0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9#readContract'
const POLYGON_MINI_APE = 'https://polygonscan.com/address/0x54aff400858dcac39797a81894d9920f16972d1d#readContract'
const POLYGON_MATIC_REWARDER = 'https://polygonscan.com/address/0x1f234b1b83e21cb5e2b99b4e498fe70ef2d6e3bf#readContract'

interface QueueFarmDetails {
    name: string;
    allocation: number | string;
    nextAllocation?: {
        allocation: number | string;
        status: 'to-queue' | 'queued';
        date?: Date | string
    }[];
    address: string;
    explorer: string;
    status: 'to-queue' | 'queued'
}

/**
 * The farm is intended only for APE-LP tokens to incentivize the DEX
 * 
 * Known Issues:
 * - CANNOT add deflationary tokens to the farm (APE-LP is not deflationary)
 * - CANNOT add ERC-777 tokens to the farm as it would allow a reentrancy attack
 *    through emergencyWithdraw which could drain all the funds in that farm. (APE-LP is an ERC-20 token)
 */


export const queueFarmDetails: QueueFarmDetails[] = [
    // {
    //     name: 'BNB/ LP',
    //     allocation: ,
    //     address: '',
    //     explorer: 'https://bscscan.com/address/',
    //     status: 'queued'
    // },
    {
        name: 'BNB/LAND LP',
        allocation: 100,
        address: '0xB15f34082Baa4E3515A49E05D4d1D40cE933da0b',
        explorer: 'https://bscscan.com/address/0xB15f34082Baa4E3515A49E05D4d1D40cE933da0b',
        status: 'queued'
    },
    {
        name: 'BNB/HUGO LP',
        allocation: 100,
        address: '0x6499B675EB745Fb2b63dc96f45A6Ea29F6172c46',
        explorer: 'https://bscscan.com/address/0x6499B675EB745Fb2b63dc96f45A6Ea29F6172c46',
        status: 'queued'
    },
    {
        name: 'BNB/HAKA LP',
        allocation: 100,
        address: '0x8B57A889ccbd4D0C522D12DCd95f327AF3803A44',
        explorer: 'https://bscscan.com/address/0x8B57A889ccbd4D0C522D12DCd95f327AF3803A44',
        status: 'queued'
    },
]


interface FarmDetails extends Omit<QueueFarmDetails, 'status' | 'nextAllocation.status'> {
    pid: number;
    status: 'active' | 'deprecated' | 'to-update'
    nextAllocation?: [{
        status: 'queued';
        allocation: number | string;
        date?: Date | string
    }]
}

export const farmDetails: FarmDetails[] = [
    {
        pid: 99,
        name: 'BNB/GUARD LP',
        allocation: 75,
        address: '0xDd2B5E024942F9a83255F41144db5648b71f01c4',
        explorer: 'https://bscscan.com/address/0xDd2B5E024942F9a83255F41144db5648b71f01c4',
        status: 'active'
    },
    {
        pid: 98,
        name: 'BNB/PERA LP',
        allocation: 50,
        address: '0xB3940bCF6e37DD612B8Dee72ADA6cf8dF57d8A95',
        explorer: 'https://bscscan.com/address/0xB3940bCF6e37DD612B8Dee72ADA6cf8dF57d8A95',
        status: 'active'
    },
    {
        pid: 97,
        name: 'BNB/MARU LP',
        allocation: 50,
        address: '0x172a5434366795ccDF755ffBf0cc04D4532A7177',
        explorer: 'https://bscscan.com/address/0x172a5434366795ccDF755ffBf0cc04D4532A7177',
        status: 'active'
    },
    {
        pid: 96,
        name: 'BNB/DINOP LP',
        allocation: 25,
        address: '0x5fCec12f1C7e57789f22289Ef75FBDB1c6b4895d',
        explorer: 'https://bscscan.com/address/0x5fCec12f1C7e57789f22289Ef75FBDB1c6b4895d',
        status: 'active'
    },
    {
        pid: 96,
        name: 'BNB/DINOP LP',
        allocation: 25,
        address: '0x5fCec12f1C7e57789f22289Ef75FBDB1c6b4895d',
        explorer: 'https://bscscan.com/address/0x5fCec12f1C7e57789f22289Ef75FBDB1c6b4895d',
        status: 'active'
    },
    {
        pid: 95,
        name: 'BNB/AXS LP',
        allocation: 200,
        address: '0x8b85A4228400fa9b2fB5bD47dB8f05b7f8Bb7F5c',
        explorer: 'https://bscscan.com/address/0x8b85A4228400fa9b2fB5bD47dB8f05b7f8Bb7F5c',
        status: 'active'
    },
    {
        pid: 94,
        name: 'BNB/BIRB LP',
        allocation: 100,
        address: '0x8F53e5940d5ADFB07e271d2812DCcdb5B6380C62',
        explorer: 'https://bscscan.com/address/0x8F53e5940d5ADFB07e271d2812DCcdb5B6380C62',
        status: 'active'
    },
    {
        pid: 93,
        name: 'BNB/CAPS LP',
        allocation: 100,
        address: '0x6Dfbf17ac70CE03388B1f88cb3C97AD79120e7b1',
        explorer: 'https://bscscan.com/address/0x6Dfbf17ac70CE03388B1f88cb3C97AD79120e7b1',
        status: 'active'
    },
    {
        pid: 92,
        name: 'BNB/SISTA LP',
        allocation: 50,
        address: '0x45546310FDA2fbDB7Ee26EA0A5b6F82D075254bC',
        explorer: 'https://bscscan.com/address/0x45546310FDA2fbDB7Ee26EA0A5b6F82D075254bC',
        status: 'active'
    },
    {
        pid: 91,
        name: 'BNB/STARS LP',
        allocation: 100,
        address: '0xBc8a4caD743d87e8754Fd5F704C62E378802CBfF',
        explorer: 'https://bscscan.com/address/0xBc8a4caD743d87e8754Fd5F704C62E378802CBfF',
        status: 'active'
    },
    {
        pid: 90,
        name: 'BNB/YFI LP',
        allocation: 200,
        nextAllocation: [{
            allocation: 100,
            status: 'queued'
        }],
        address: '0xA3421Bd2B3B1578FF43Ab95C10f667e5A3bbCeF7',
        explorer: 'https://bscscan.com/address/0xA3421Bd2B3B1578FF43Ab95C10f667e5A3bbCeF7',
        status: 'active'
    },
    {
        pid: 89,
        name: 'BNB/BISON LP',
        allocation: 100,
        address: '0xEC1214Ee197304c17EB9e427E246a4Fd37BA718E',
        explorer: 'https://bscscan.com/address/0xEC1214Ee197304c17EB9e427E246a4Fd37BA718E',
        status: 'active'
    },
    {
        pid: 88,
        name: 'BNB/NEWB LP',
        allocation: 50,
        address: '0xF0cC208460BA9F55F320a72F6C6B63154A42c8C0',
        explorer: 'https://bscscan.com/address/0xF0cC208460BA9F55F320a72F6C6B63154A42c8C0',
        status: 'active'
    },
    {
        pid: 87,
        name: 'BNB/PACOCA LP',
        allocation: 50,
        address: '0x0fee6E1E55fA772fAE71E6734a7F9E8622900D75',
        explorer: 'https://bscscan.com/address/0x0fee6E1E55fA772fAE71E6734a7F9E8622900D75',
        status: 'active'
    },
    {
        pid: 86,
        name: 'BNB/XVS LP',
        allocation: 100,
        address: '0x9e199da6f87E09a290724EbA866eEdae2e971A0b',
        explorer: 'https://bscscan.com/address/0x9e199da6f87E09a290724EbA866eEdae2e971A0b',
        status: 'active'
    },
    {
        pid: 85,
        name: 'BNB/EPS LP',
        allocation: 100,
        address: '0x97c4C531e739E870d958940E8688017894084003',
        explorer: 'https://bscscan.com/address/0x97c4C531e739E870d958940E8688017894084003',
        status: 'active'
    },
    {
        pid: 84,
        name: 'BNB/TWT LP',
        allocation: 100,
        address: '0x4c48D692e3de076C7b844B956b28cdd1DD5C0945',
        explorer: 'https://bscscan.com/address/0x4c48D692e3de076C7b844B956b28cdd1DD5C0945',
        status: 'active'
    },
    {
        pid: 83,
        name: 'BNB/SFP LP',
        allocation: 100,
        address: '0x6411A2240c8cD1dd48718eEE1ae4a10E71123Fd3',
        explorer: 'https://bscscan.com/address/0x6411A2240c8cD1dd48718eEE1ae4a10E71123Fd3',
        status: 'active'
    },
    {
        pid: 82,
        name: 'BNB/GNT LP',
        allocation: 50,
        address: '0xE19C4B62eAb3b1b61C93c5Ddb27779c992413b0E',
        explorer: 'https://bscscan.com/address/0xE19C4B62eAb3b1b61C93c5Ddb27779c992413b0E',
        status: 'active'
    },
    {
        pid: 81,
        name: 'BNB/SKILL LP',
        allocation: 300,
        address: '0x0dEB588c1EC6f1D9f348126D401f05c4c7B7a80c',
        explorer: 'https://bscscan.com/address/0x0dEB588c1EC6f1D9f348126D401f05c4c7B7a80c',
        status: 'active'
    },
    {
        pid: 80,
        name: 'BNB/FRUIT LP',
        allocation: 50,
        address: '0x0bE55fd1Fdc7134Ff8412e8BAaC63CBb691B1d64',
        explorer: 'https://bscscan.com/address/0x0bE55fd1Fdc7134Ff8412e8BAaC63CBb691B1d64',
        status: 'active'
    },
    {
        pid: 79,
        name: 'BNB/LORY LP',
        allocation: 100,
        address: '0x3d0c2Ee0156675B90Bc41E5559970415a20414F5',
        explorer: 'https://bscscan.com/address/0x3d0c2Ee0156675B90Bc41E5559970415a20414F5',
        status: 'active'
    },
    {
        pid: 78,
        name: 'BNB/SCAM LP',
        allocation: 50,
        address: '0xaAB7b3C31c8f76e4bFe0D0Cd073b1bCa6279072c',
        explorer: 'https://bscscan.com/address/0xaAB7b3C31c8f76e4bFe0D0Cd073b1bCa6279072c',
        status: 'active'
    },
    {
        pid: 77,
        name: 'BNB/BOG LP',
        allocation: 100,
        address: '0x9D8370C3E6833942b8c38478c84ef74374F28b9f',
        explorer: 'https://bscscan.com/address/0x9D8370C3E6833942b8c38478c84ef74374F28b9f',
        status: 'active'
    },
    {
        pid: 76,
        name: 'BNB/Wyvern LP',
        allocation: 25,
        address: '0xeef751Bba57E90B832c96b0E65ef5430868C69a7',
        explorer: 'https://bscscan.com/address/0xeef751Bba57E90B832c96b0E65ef5430868C69a7',
        status: 'active'
    },
    {
        pid: 75,
        name: 'POLYGON FARM',
        allocation: 2000,
        address: '0xA5818a82016cb07D0D9892736A2Abd1B47E78ea4',
        explorer: 'https://bscscan.com/address/0xA5818a82016cb07D0D9892736A2Abd1B47E78ea4',
        status: 'active'
    },
    {
        pid: 74,
        name: 'BNB/ACD LP',
        allocation: 25,
        address: '0xbe3e38918Ca1180f0285fa18c3FA154d0ddE6853',
        explorer: 'https://bscscan.com/address/0xbe3e38918Ca1180f0285fa18c3FA154d0ddE6853',
        status: 'active'
    },
    {
        pid: 73,
        name: 'BNB/MBOX LP',
        allocation: 25,
        address: '0xE5459c34E13797372f6c95c0aAC81A5fAf60223E',
        explorer: 'https://bscscan.com/address/0xE5459c34E13797372f6c95c0aAC81A5fAf60223E',
        status: 'active'
    },
    {
        pid: 72,
        name: 'BNB/TWIN LP',
        allocation: 75,
        address: '0x39ca344E2e9AAf125b0002aA37258C8b1Ed30A78',
        explorer: 'https://bscscan.com/address/0x39ca344E2e9AAf125b0002aA37258C8b1Ed30A78',
        status: 'active'
    },
    {
        pid: 71,
        name: 'BNB/HERO LP',
        allocation: 25,
        address: '0x051724874952381e4efd22846b2789334d52abdb',
        explorer: 'https://bscscan.com/address/0x051724874952381e4efd22846b2789334d52abdb',
        status: 'active'
    },
    {
        pid: 70,
        name: 'BNB/GMR LP',
        allocation: 75,
        address: '0xB0D759CD87B74f079166283f4f6631F5703cEa1A',
        explorer: 'https://bscscan.com/address/0xB0D759CD87B74f079166283f4f6631F5703cEa1A',
        status: 'active'
    },
    {
        pid: 69,
        name: 'BNB/HIFI LP',
        allocation: 200,
        address: '0xf093cE6778c4d7D99C23f714297FFf15a661d354',
        explorer: 'https://bscscan.com/address/0xf093cE6778c4d7D99C23f714297FFf15a661d354',
        status: 'active'
    },
    {
        pid: 68,
        name: 'BNB/GRAND LP',
        allocation: 50,
        address: '0x0c52721790387f97fa77acaf151667c9e9730c76',
        explorer: 'https://bscscan.com/address/0x0c52721790387f97fa77acaf151667c9e9730c76',
        status: 'active'
    },
    {
        pid: 67,
        name: 'BNB/ATA LP',
        allocation: 75,
        address: '0x51DA890085da091b84e27c7A8234E371943b0af0',
        explorer: 'https://bscscan.com/address/0x51DA890085da091b84e27c7A8234E371943b0af0',
        status: 'active'
    },
    {
        pid: 66,
        name: 'BNB/FEG LP',
        allocation: 100,
        address: '0x73CDdF4ea34Dbd872f89e98c2866c81929AAFE50',
        explorer: 'https://bscscan.com/address/0x73CDdF4ea34Dbd872f89e98c2866c81929AAFE50',
        status: 'active'
    },
    {
        pid: 65,
        name: 'BNB/SPACE LP',
        allocation: 100,
        address: '0xd0F82498051067E154d1dcd3d88fA95063949D7e',
        explorer: 'https://bscscan.com/address/0xd0F82498051067E154d1dcd3d88fA95063949D7e',
        status: 'active'
    },
    {
        pid: 64,
        name: 'BNB/bMXX LP',
        allocation: 50,
        address: '0xcF2C3aF91B5A55E283a8A8C2932B88009B557b4a',
        explorer: 'https://bscscan.com/address/0xcF2C3aF91B5A55E283a8A8C2932B88009B557b4a',
        status: 'active'
    },
    {
        pid: 63,
        name: 'BNB/TYPH LP',
        allocation: 50,
        address: '0xFEaf192c2662E5700bDa860c58d2686d9cc12Ec8',
        explorer: 'https://bscscan.com/address/0xFEaf192c2662E5700bDa860c58d2686d9cc12Ec8',
        status: 'active'
    },
    {
        pid: 62,
        name: 'BNB/pCWS LP',
        allocation: 25,
        address: '0x334E697022AeAbbA58385aFB3Abf3D9347C1b260',
        explorer: 'https://bscscan.com/address/0x334E697022AeAbbA58385aFB3Abf3D9347C1b260',
        status: 'active'
    },
    {
        pid: 61,
        name: 'BNB/CRUSH LP',
        allocation: 75,
        address: '0x8A10489f1255fb63217Be4cc96B8F4CD4D42a469',
        explorer: 'https://bscscan.com/address/0x8A10489f1255fb63217Be4cc96B8F4CD4D42a469',
        status: 'active'
    },
    {
        pid: 60,
        name: 'BNB/SHIB LP',
        allocation: 200,
        address: '0xC0AFB6078981629F7eAe4f2ae93b6DBEA9D7a7e9',
        explorer: 'https://bscscan.com/address/0xC0AFB6078981629F7eAe4f2ae93b6DBEA9D7a7e9',
        status: 'active'
    },
    {
        pid: 59,
        name: 'BNB/CELR LP',
        allocation: 100,
        address: '0xB7F42e58Cf2364ac994F93f7afF3b158CFA3dC76',
        explorer: 'https://bscscan.com/address/0xB7F42e58Cf2364ac994F93f7afF3b158CFA3dC76',
        status: 'active'
    },
    {
        pid: 58,
        name: 'BNB/TAPE LP',
        allocation: 50,
        address: '0x756d4406169273d99aAc8366cf5eAf7865d6a9b9',
        explorer: 'https://bscscan.com/address/0x756d4406169273d99aAc8366cf5eAf7865d6a9b9',
        status: 'active'
    },
    {
        pid: 57,
        name: 'BNB/BLZ LP',
        allocation: 100,
        address: '0x015f807d0186f7e62810d0c597a23cb19ff57e4d',
        explorer: 'https://bscscan.com/address/0x015f807d0186f7e62810d0c597a23cb19ff57e4d',
        status: 'active'
    },
    {
        pid: 56,
        name: 'BNB/SNX LP',
        allocation: 100,
        address: '0x8b1F1F28a8CcbaA8a8Bc1582921ECe97Ce99d9e1',
        explorer: 'https://bscscan.com/address/0x8b1F1F28a8CcbaA8a8Bc1582921ECe97Ce99d9e1',
        status: 'active'
    },
    {
        pid: 55,
        name: 'BNB/MOONLIGHT LP',
        allocation: 25,
        address: '0xe6de19Ae48969aF0a6f78271e41D3CE47580eaFB',
        explorer: 'https://bscscan.com/address/0xe6de19Ae48969aF0a6f78271e41D3CE47580eaFB',
        status: 'active'
    },
    {
        pid: 54,
        name: 'BNB/NEAR LP',
        allocation: 100,
        address: '0xB75724635A6cDa850f08b578F23a568CeDba099D',
        explorer: 'https://bscscan.com/address/0xB75724635A6cDa850f08b578F23a568CeDba099D',
        status: 'active'
    },
    {
        pid: 53,
        name: 'BNB/COTI LP',
        allocation: 75,
        address: '0xaCfDCF0486ADC2421aAc3FFc0923b9c56FAEBC47',
        explorer: 'https://bscscan.com/address/0xaCfDCF0486ADC2421aAc3FFc0923b9c56FAEBC47',
        status: 'active'
    },
    {
        pid: 52,
        name: 'BNB/ZEC LP',
        allocation: 100,
        address: '0x2B2C771e44aF4C6f858598308e05FB89b23f11cE',
        explorer: 'https://bscscan.com/address/0x2B2C771e44aF4C6f858598308e05FB89b23f11cE',
        status: 'active'
    },
    {
        pid: 51,
        name: 'BNB/AVAX LP',
        allocation: 100,
        address: '0x40aFc7CBd0Dc2bE5860F0035b717d20Afb4827b2',
        explorer: 'https://bscscan.com/address/0x40aFc7CBd0Dc2bE5860F0035b717d20Afb4827b2',
        status: 'active'
    },
    {
        pid: 50,
        name: 'BNB/NRV LP',
        allocation: 75,
        address: '0x876Ba49c4F438643Ab33F871e14a54CBb897Df49',
        explorer: 'https://bscscan.com/address/0x876Ba49c4F438643Ab33F871e14a54CBb897Df49',
        status: 'active'
    },
    {
        pid: 49,
        name: 'BNB/FTM LP',
        allocation: 200,
        address: '0x47A0B7bA18Bb80E4888ca2576c2d34BE290772a6',
        explorer: 'https://bscscan.com/address/0x47A0B7bA18Bb80E4888ca2576c2d34BE290772a6',
        status: 'active'
    },
    {
        pid: 48,
        name: 'BNB/COMP LP',
        allocation: 100,
        address: '0xb4c0c621B2eDfE6C22585ebAC56b0e634907B8A7',
        explorer: 'https://bscscan.com/address/0xb4c0c621B2eDfE6C22585ebAC56b0e634907B8A7',
        status: 'active'
    },
    {
        pid: 47,
        name: 'BNB/ETC LP',
        allocation: 100,
        address: '0xDd6C7A955C72B3FFD546d8dadBf7669528d8F785',
        explorer: 'https://bscscan.com/address/0xDd6C7A955C72B3FFD546d8dadBf7669528d8F785',
        status: 'active'
    },
    {
        pid: 46,
        name: 'BNB/AAVE LP',
        allocation: 100,
        address: '0xf13e007e181A8F57eD3a4D4CcE0A9ff9E7241CEf',
        explorer: 'https://bscscan.com/address/0xf13e007e181A8F57eD3a4D4CcE0A9ff9E7241CEf',
        status: 'active'
    },
    {
        pid: 45,
        name: 'BNB/MATIC LP',
        allocation: 100,
        address: '0x29A4A3D77c010CE100A45831BF7e798f0f0B325D',
        explorer: 'https://bscscan.com/address/0x29A4A3D77c010CE100A45831BF7e798f0f0B325D',
        status: 'active'
    },
    {
        pid: 44,
        name: 'BNB/WATCH LP',
        allocation: 50,
        address: '0xa00A91fBB39051e2a6368424A93895c3f1F2290b',
        explorer: 'https://bscscan.com/address/0xa00A91fBB39051e2a6368424A93895c3f1F2290b',
        status: 'active'
    },
    {
        pid: 43,
        name: 'BNB/vBSWAP LP',
        allocation: 0,
        address: '0xD59b4f88Da3b5cfc70CdF9B61c53Df475d4D4f47',
        explorer: 'https://bscscan.com/address/0xD59b4f88Da3b5cfc70CdF9B61c53Df475d4D4f47',
        status: 'deprecated'
    },
    {
        pid: 42,
        name: 'BNB/bxBTC LP',
        allocation: 10,
        address: '0xc2feF4BEC915315beF9f6E8a06b2516E64D29D06',
        explorer: 'https://bscscan.com/address/0xc2feF4BEC915315beF9f6E8a06b2516E64D29D06',
        status: 'active'
    },
    {
        pid: 41,
        name: 'BNB/AUTO LP',
        allocation: 75,
        address: '0x649A5Ad5135B4bd287e5AcA8d41f4d5e1b52af5C',
        explorer: 'https://bscscan.com/address/0x649A5Ad5135B4bd287e5AcA8d41f4d5e1b52af5C',
        status: 'active'
    },
    {
        pid: 40,
        name: 'BUSD/DAI LP',
        allocation: 100,
        address: '0x8b6EcEA3e9bd6290c2150A89AF6c69887AaF1870',
        explorer: 'https://bscscan.com/address/0x8b6EcEA3e9bd6290c2150A89AF6c69887AaF1870',
        status: 'active'
    },
    {
        pid: 39,
        name: 'BNB/LTC LP',
        allocation: 100,
        address: '0x0F12362c017Fe5101c7bBa09390f1CB729f5B318',
        explorer: 'https://bscscan.com/address/0x0F12362c017Fe5101c7bBa09390f1CB729f5B318',
        status: 'active'
    },
    {
        pid: 38,
        name: 'BNB/DOGE LP',
        allocation: 100,
        address: '0xfd1ef328A17A8e8Eeaf7e4Ea1ed8a108E1F2d096',
        explorer: 'https://bscscan.com/address/0xfd1ef328A17A8e8Eeaf7e4Ea1ed8a108E1F2d096',
        status: 'active'
    },
    {
        pid: 37,
        name: 'BNB/BFT LP',
        allocation: 100,
        address: '0x1696A65eA693593Ba771b5A7aFC54C8eaf4C20dE',
        explorer: 'https://bscscan.com/address/0x1696A65eA693593Ba771b5A7aFC54C8eaf4C20dE',
        status: 'active'
    },
    {
        pid: 36,
        name: 'BNB/LINK LP',
        allocation: 100,
        address: '0x092ada3818db7fbb8e0a2124ff218c5125c1cce6',
        explorer: 'https://bscscan.com/address/0x092ada3818db7fbb8e0a2124ff218c5125c1cce6',
        status: 'active'
    },
    {
        pid: 35,
        name: 'BNB/SXP LP',
        allocation: 100,
        address: '0xf726b3e81fa7166b9c2cfd7eb7fe8ccbcb6b1355',
        explorer: 'https://bscscan.com/address/0xf726b3e81fa7166b9c2cfd7eb7fe8ccbcb6b1355',
        status: 'active'
    },
    {
        pid: 34,
        name: 'BUSD/USDT LP',
        allocation: 100,
        address: '0x2e707261d086687470b515b320478eb1c88d49bb',
        explorer: 'https://bscscan.com/address/0x2e707261d086687470b515b320478eb1c88d49bb',
        status: 'active'
    },
    {
        pid: 33,
        name: 'BNB/DOT LP',
        allocation: 100,
        address: '0x21cbb561c5d7d70e9e6cc42136cb22f07552aeef',
        explorer: 'https://bscscan.com/address/0x21cbb561c5d7d70e9e6cc42136cb22f07552aeef',
        status: 'active'
    },
    {
        pid: 32,
        name: 'BNB/XRP LP',
        allocation: 100,
        address: '0x6f0f18f5fcc1466ec41c8106689e10befe68d1c0',
        explorer: 'https://bscscan.com/address/0x6f0f18f5fcc1466ec41c8106689e10befe68d1c0',
        status: 'active'
    },
    {
        pid: 31,
        name: 'BNB/ONT LP',
        allocation: 75,
        address: '0x924D3f2F94618e8Ee837d4C2b8d703F0de12a57e',
        explorer: 'https://bscscan.com/address/0x924D3f2F94618e8Ee837d4C2b8d703F0de12a57e',
        status: 'active'
    },
    {
        pid: 30,
        name: 'BNB/KeyFi LP',
        allocation: 25,
        address: '0x7A8ACAEAfC4Fa051De4EAbff8D1abdD0388aE08a',
        explorer: 'https://bscscan.com/address/0x7A8ACAEAfC4Fa051De4EAbff8D1abdD0388aE08a',
        status: 'active'
    },
    {
        pid: 29,
        name: 'BNB/SWAMP LP',
        allocation: 25,
        address: '0xA3f0F63268DF562C71051AC5e81460e857C32c12',
        explorer: 'https://bscscan.com/address/0xA3f0F63268DF562C71051AC5e81460e857C32c12',
        status: 'active'
    },
    {
        pid: 28,
        name: 'BNB/NUTS LP',
        allocation: 50,
        address: '0x789fd04BFbC64169104466Ee0d48716E0452Bcf6',
        explorer: 'https://bscscan.com/address/0x789fd04BFbC64169104466Ee0d48716E0452Bcf6',
        status: 'active'
    },
    {
        pid: 27,
        name: 'BNB/JDI LP',
        allocation: 100,
        address: '0xfb6063f29AF6dcd1fc03A8E221c6D91DEabbE764',
        explorer: 'https://bscscan.com/address/0xfb6063f29AF6dcd1fc03A8E221c6D91DEabbE764',
        status: 'active'
    },
    {
        pid: 24,
        name: 'BNB/NAUT LP',
        allocation: 100,
        nextAllocation: [{
            allocation: 0,
            status: 'queued'
        }],
        address: '0x288EA5437c7aaD045a393cee2F41E548df24d1C8BNB/CAKE LP',
        explorer: 'https://bscscan.com/address/0x288EA5437c7aaD045a393cee2F41E548df24d1C8BNB/CAKE LP',
        status: 'active'
    },
    {
        pid: 23,
        name: 'BNB/ROCKET LP',
        allocation: 0,
        address: '0x93fa1a6357de25031311f784342c33a26cb1c87a',
        explorer: 'https://bscscan.com/address/0x93fa1a6357de25031311f784342c33a26cb1c87a',
        status: 'deprecated'
    },
    {
        pid: 22,
        name: 'BNB/IOTA LP',
        allocation: 100,
        address: '0x0D70924695B6Ae496F0A74A36bf79d47307dD519',
        explorer: 'https://bscscan.com/address/0x0D70924695B6Ae496F0A74A36bf79d47307dD519',
        status: 'active'
    },
    {
        pid: 21,
        name: 'ETH/BAT LP',
        allocation: 50,
        address: '0x85D87C038917eC8949f12B06262bB9d7a1290DB6',
        explorer: 'https://bscscan.com/address/0x85D87C038917eC8949f12B06262bB9d7a1290DB6',
        status: 'active'
    },
    {
        pid: 20,
        name: 'BNB/BAT LP',
        allocation: 100,
        address: '0x6e425B4fc4Efd070Dc0deF1654a17946C7e6b3C4',
        explorer: 'https://bscscan.com/address/0x6e425B4fc4Efd070Dc0deF1654a17946C7e6b3C4',
        status: 'active'
    },
    {
        pid: 19,
        name: 'BANANA/NAUT LP',
        allocation: 0,
        address: '0xf579A6196d6CC8c2C40952Ece57345AbbD589c91',
        explorer: 'https://bscscan.com/address/0xf579A6196d6CC8c2C40952Ece57345AbbD589c91',
        status: 'deprecated'
    },
    {
        pid: 18,
        name: 'ETH/ADA LP',
        allocation: 50,
        address: '0x61FE209E404166a53Cc627d0ae30A65606315dA7',
        explorer: 'https://bscscan.com/address/0x61FE209E404166a53Cc627d0ae30A65606315dA7',
        status: 'active'
    },
    {
        pid: 17,
        name: 'BNB/ADA LP',
        allocation: 200,
        address: '0x40d4543887E4170A1A40Cd8dB15A6b297c812Cb1',
        explorer: 'https://bscscan.com/address/0x40d4543887E4170A1A40Cd8dB15A6b297c812Cb1',
        status: 'active'
    },
    {
        pid: 16,
        name: 'BNB/GFCE LP',
        allocation: 0,
        address: '0xD7903933B10504a7C67f191285a6A7E5A233fD3B',
        explorer: 'https://bscscan.com/address/0xD7903933B10504a7C67f191285a6A7E5A233fD3B',
        status: 'deprecated'
    },
    {
        pid: 15,
        name: 'BANANA/GFCE LP',
        allocation: 0,
        address: '0x9C87cae57f0962997d9bd66C24f3425d20543e3d',
        explorer: 'https://bscscan.com/address/0x9C87cae57f0962997d9bd66C24f3425d20543e3d',
        status: 'deprecated'
    },
    {
        pid: 14,
        name: 'ETH/SUSHI',
        allocation: 50,
        address: '0x044F2b275A344D4edfc3d98e1cb7c02B30e6484e',
        explorer: 'https://bscscan.com/address/0x044F2b275A344D4edfc3d98e1cb7c02B30e6484e',
        status: 'active'
    },
    {
        pid: 13,
        name: 'BNB/SUSHI',
        allocation: 100,
        address: '0x1D0C3044eBf055986c52D38b19B5369374E6Bc6A',
        explorer: 'https://bscscan.com/address/0x1D0C3044eBf055986c52D38b19B5369374E6Bc6A',
        status: 'active'
    },
    {
        pid: 12,
        name: 'BANANA/SUSHI LP',
        allocation: 0,
        address: '0xdbcdA7B58c2078fcc790dD7C2c7272EdB7EAa2b0',
        explorer: 'https://bscscan.com/address/0xdbcdA7B58c2078fcc790dD7C2c7272EdB7EAa2b0',
        status: 'deprecated'
    },
    {
        pid: 11,
        name: 'BNB/BIFI LP',
        allocation: 100,
        address: '0xDDd3f9d5Bd347c55D18752c0C2075698EC657750',
        explorer: 'https://bscscan.com/address/0xDDd3f9d5Bd347c55D18752c0C2075698EC657750',
        status: 'active'
    },
    {
        pid: 10,
        name: 'BANANA/BIFI LP',
        allocation: 0,
        address: '0x2ce820319047c407cb952060Df5f7fb3D9A9a688',
        explorer: 'https://bscscan.com/address/0x2ce820319047c407cb952060Df5f7fb3D9A9a688',
        status: 'deprecated'
    },
    {
        pid: 9,
        name: 'BANANA/BREW LP',
        allocation: 0,
        address: '0x5514E0E1DA40A38E19d58e8B6E16226E16e183fA',
        explorer: 'https://bscscan.com/address/0x5514E0E1DA40A38E19d58e8B6E16226E16e183fA',
        status: 'deprecated'
    },
    {
        pid: 8,
        name: 'BUSD/USDC LP',
        allocation: 150,
        address: '0xC087C78AbaC4A0E900a327444193dBF9BA69058E',
        explorer: 'https://bscscan.com/address/0xC087C78AbaC4A0E900a327444193dBF9BA69058E',
        status: 'active'
    },
    {
        pid: 7,
        name: 'BANANA/BAKE LP',
        allocation: 0,
        address: '0x51bB531A5253837A23cE8de478a4941A71A4202C',
        explorer: 'https://bscscan.com/address/0x51bB531A5253837A23cE8de478a4941A71A4202C',
        status: 'deprecated'
    },
    {
        pid: 6,
        name: 'BANANA/CAKE LP',
        allocation: 0,
        address: '0x9949E1DB416a8a05A0cAC0bA6Ea152ba8729e893',
        explorer: 'https://bscscan.com/address/0x9949E1DB416a8a05A0cAC0bA6Ea152ba8729e893',
        status: 'deprecated'
    },
    {
        pid: 5,
        name: 'BNB/ETH LP',
        allocation: 175,
        address: '0x1E1aFE9D9c5f290d8F6996dDB190bd111908A43D',
        explorer: 'https://bscscan.com/address/0x1E1aFE9D9c5f290d8F6996dDB190bd111908A43D',
        status: 'active'
    },
    {
        pid: 4,
        name: 'BNB/BTCB LP',
        allocation: 100,
        address: '0x1E1aFE9D9c5f290d8F6996dDB190bd111908A43D',
        explorer: 'https://bscscan.com/address/0x1E1aFE9D9c5f290d8F6996dDB190bd111908A43D',
        status: 'active'
    },
    {
        pid: 3,
        name: 'BNB/BUSD LP',
        allocation: 400,
        address: '0x51e6D27FA57373d8d4C256231241053a70Cb1d93',
        explorer: 'https://bscscan.com/address/0x51e6D27FA57373d8d4C256231241053a70Cb1d93',
        status: 'active'
    },
    {
        pid: 2,
        name: 'BANANA/BUSD LP',
        allocation: 1500,
        address: '0x7Bd46f6Da97312AC2DBD1749f82E202764C0B914',
        explorer: 'https://bscscan.com/address/0x7Bd46f6Da97312AC2DBD1749f82E202764C0B914',
        status: 'active'
    },
    {
        pid: 1,
        name: 'BANANA/BNB LP',
        allocation: 4000,
        address: '0xF65C1C0478eFDe3c19b49EcBE7ACc57BB6B1D713',
        explorer: 'https://bscscan.com/address/0xF65C1C0478eFDe3c19b49EcBE7ACc57BB6B1D713',
        status: 'active'
    },
    {
        pid: 0,
        name: 'BANANA',
        allocation: '25% of totalAllocPoint',
        address: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
        explorer: 'https://bscscan.com/address/0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
        status: 'active'
    },
]
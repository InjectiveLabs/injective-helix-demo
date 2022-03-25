export interface Asset{
    name: string
}

export class Coin implements Asset{
    constructor(readonly name: string, readonly denom: string){
        this.name = name
        this.denom = denom
    }
}

export class Currency implements Asset{
    constructor(readonly name: string){
        this.name = name
    }
}


export const USD = new Currency('USD')

//denoms for devnet1
export const BTC = new Coin('BTC', null)
export const ETH = new Coin('ETH', null)
export const INJ = new Coin('INJ', null)
export const WETH = new Coin('wETH', null)
export const ATOM = new Coin('ATOM', "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9")
export const USDC = new Coin('USDC', "peggy0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48")
export const BNB = new Coin('BNB', "peggy0xB8c77482e45F1F44dE1745F52C74426C631bDD52")
export const AAVE = new Coin('AAVE', "peggy0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9")
export const USDT = new Coin('USDT', "peggy0xdAC17F958D2ee523a2206206994597C13D831ec7")
export const LUNA = new Coin('LUNA', "ibc/B8AF5D92165F35AB31F3FC7C7B444B9D240760FA5D406C49D24862BD0284E395")
export const LINK = new Coin('LINK', "peggy0x514910771AF9Ca656af840dff83E8264EcF986CA")
export const UNI = new Coin('UNI', "peggy0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984")
export const YFI = new Coin('YFI', "peggy0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e")
export const GF = new Coin('GF', "peggy0xAaEf88cEa01475125522e117BFe45cF32044E238")
export const MATIC = new Coin('MATIC', "peggy0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0")
export const UST = new Coin('UST', "ibc/B448C0CA358B958301D328CCDC5D5AD642FC30A6D3AE106FF721DB315F3DDE5C")
export const DAI = new Coin('DAI', null)
export const ZRX = new Coin('ZRX', "peggy0xE41d2489571d322189246DaFA5ebDe1F4699F498")

export const COINS = [INJ, BTC, ETH, WETH, ATOM, USDC, BNB, AAVE, USDT, LUNA, LINK, UNI, YFI, GF, MATIC, UST, DAI, ZRX]
export const CURRENCIES = [USD]

export class AssetFactory {
    static fromText(text: string): Asset {
        text = text.toUpperCase().trim()
        for (var c of COINS) {
            if (c.name.toUpperCase() === text) {
                return c
            }
        }

        for (var cu of CURRENCIES) {
            if (cu.name.toUpperCase() === text) {
                return cu
            }
        }

        throw new Error(`No asset for text '${text}' found`)
    }

    static fromDenom(text: string): Asset {
        text = text.toUpperCase().trim()
        for (var c of COINS) {
            if (c.denom.toUpperCase() === text) {
                return c
            }
        }

        throw new Error(`No asset with denom '${text}' found`)
    }
}
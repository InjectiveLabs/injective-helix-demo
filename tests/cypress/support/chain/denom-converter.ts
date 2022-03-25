export default class DenomConverter{

    private static contractToHuman: Map<string, string> = new Map([
        ["dai", "peggy0x6b175474e89094c44da98b954eedeac495271d0f"],
        ["usdc", "peggy0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
        ["uni", "peggy0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"],
        ["aave", "peggy0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9"],
        ["matic", "peggy0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"],
        ["zrx", "peggy0xE41d2489571d322189246DaFA5ebDe1F4699F498"],
        ["link", "peggy0x514910771AF9Ca656af840dff83E8264EcF986CA"],
        ["bnb", "peggy0xB8c77482e45F1F44dE1745F52C74426C631bDD52"],
        ["yfi", "peggy0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e"],
        ["gf", "peggy0xAaEf88cEa01475125522e117BFe45cF32044E238"],
        ["atom", "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9"],
        ["luna", "ibc/B8AF5D92165F35AB31F3FC7C7B444B9D240760FA5D406C49D24862BD0284E395"],
        ["ust", "ibc/B448C0CA358B958301D328CCDC5D5AD642FC30A6D3AE106FF721DB315F3DDE5C"]
    ])

    static toHuman(denom: string): string {
        if (denom.indexOf("0x") !== -1 && denom.indexOf("ibc/") !== -1) {
            return denom
        }

        for (var inMap in this.contractToHuman.values()) {
            if (denom === inMap) {
                return inMap
            }
        }

        throw new Error(`unkown denom ${denom}`)
    }

    static toContract(token: string): string {
        token = token.toLowerCase()
        if (token.indexOf("0x") === -1 && token.indexOf("ibc/") === -1) {
            return token
        }

        if (!this.contractToHuman.has(token)) {
            throw new Error(`unkown token ${token}`)
        }

        return this.contractToHuman[token]
    }
}
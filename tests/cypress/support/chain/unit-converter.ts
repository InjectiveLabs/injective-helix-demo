import divide from 'divide-bigint'
import { Asset } from "../../domain/injective/assets"

export default class UnitConverter {

    private decimalPrecisionMap: Map<string, number> = new Map([
        // ["inj", BigInt("1000000000000000000")],
        // ["tab", BigInt("1000000")],
        // ["usdc", BigInt("1000000")],
        // ["usdt", BigInt("1000000")],
        // ["dai", BigInt("1000000000000000000")],
        // ["uni", BigInt("1000000000000000000")],
        // ["aave", BigInt("1000000000000000000")],
        // ["matic", BigInt("1000000000000000000")],
        // ["zrx", BigInt("1000000000000000000")],
        // ["link", BigInt("1000000000000000000")],
        // ["bnb", BigInt("1000000000000000000")],
        // ["yfi", BigInt("1000000000000000000")],
        // ["atom", BigInt("1000000")],
        // ["gf", BigInt("1000000000000000000")],
        // ["luna", BigInt("1000000")],
        // ["ust", BigInt("1000000")],
        // ["weth", BigInt("1000000000000000000")],
        // ["eth", BigInt("1000000000000000000")],
        // ["tab", BigInt("1000000")],
        // ["dai", BigInt("1000000000000000000")],
        // ["uni", BigInt("1000000000000000000")],
        // ["aave", BigInt("1000000000000000000")],
        // ["matic", BigInt("1000000000000000000")],
        // ["zrx", BigInt("1000000000000000000")],
        // ["bnb", BigInt("1000000000000000000")],
        // ["yfi", BigInt("1000000000000000000")],
        // ["atom", BigInt("1000000")],
        // ["gf", BigInt("1000000000000000000")],
        // ["luna", BigInt("1000000")],
        // ["ust", BigInt("1000000")],
        // ["weth", BigInt("1000000000000000000")],
        ["inj", 1e18],
        ["usdc", 1e6],
        ["usdt", 1e6],
        ["link", 1e18],
        ["eth", 1e16],
    ])

    fromBase(asset: Asset, value: number): number {
        let name = asset.name.toLowerCase()
        if (!this.decimalPrecisionMap.has(name)) {
            throw Error(`No precision found for asset '${name}'`)
        }

        return value / this.decimalPrecisionMap.get(name)
    }

    toBase(asset: Asset, value: number): number {
        let name = asset.name.toLowerCase()
        if (!this.decimalPrecisionMap.has(name)) {
            throw Error(`No precision found for asset '${name}'`)
        }

        return value * this.decimalPrecisionMap.get(name)
    }

    fromApiSpotPrice(value: number): number {
        return value * 10e11
    }
}
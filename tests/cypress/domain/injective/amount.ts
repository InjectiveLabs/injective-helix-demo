import { Asset } from './assets'

export default class Amount{
    constructor(readonly asset: Asset, readonly value: string) {
        this.asset = asset
        this.value = Number(this.cleanValue(value)).toString()
    }

    getValueAsNumber(): number {
        return Number(this.value)
    }

    private cleanValue(value: string): string {
        let onlyDigits = value.onlyNumbers()
        if (onlyDigits == '--') {
            return '0.0'
        }

        return onlyDigits
    }

    invertSign(): Amount {
        return new Amount(this.asset, String(-Number(this.value)))
    }

    toString(): string {
        return `${this.value} ${this.asset.name}`
    }
}
import { Coin, Asset } from "./assets"
import Amount from "./amount"

export class AccountSummary{
    constructor(readonly valueUsd: Amount, readonly valueBtc: Amount) {
        this.valueUsd = valueUsd
        this.valueBtc = valueBtc
    }
}

export class WalletBalances{
    constructor(readonly walletValue: Amount, readonly balances: Array<AssetBalance>) {
        this.balances = balances
        this.walletValue = walletValue
    }

    getBalance(asset: Asset): AssetBalance {
        for (var balance of this.balances) {
            if (balance.coin === asset) {
                return balance
            }
        }

        return null
    }

    totalUsdValueMatchesBalances(): boolean {
        let sumOfBalances = this.balances.map(value => { return value.valueUsd.getValueAsNumber()}).reduce<number>((total: number, element: number) => { return total + element }, 0)

        return sumOfBalances === this.walletValue.getValueAsNumber()
    }
}

export class TradingAccountBalances {
    constructor(readonly portfolioValue: Amount, readonly available: Amount, readonly balances: Array<TradingBalance>) {
        this.portfolioValue = portfolioValue
        this.available = available
        this.balances = balances
    }

    getBalance(asset: Asset): TradingBalance {
        for (var balance of this.balances) {
            if (balance.coin === asset) {
                return balance
            }
        }

        return null
    }

    totalUsdValueMatchesBalances(): boolean {
        let sumOfBalances = this.balances.map(value => { return value.valueUsd.getValueAsNumber()}).reduce<number>((total: number, element: number) => { return total + element }, 0)

        return sumOfBalances === this.portfolioValue.getValueAsNumber()
    }
}

export class AssetBalance{
  constructor(
    readonly coin: Coin,
    readonly total: Amount,
    readonly valueUsd: Amount,
    readonly valueBtc: Amount
) {
    this.coin = coin
    this.total = total
    this.valueUsd = valueUsd
    this.valueBtc = valueBtc
  }
}

export class TradingBalance extends AssetBalance{
    constructor(
        readonly coin: Coin,
        readonly total: Amount,
        readonly available: Amount,
        readonly marginHold: Amount,
        readonly pnl: Amount,
        readonly valueUsd: Amount,
        readonly valueBtc: Amount,
    ) {
        super(coin, total, valueUsd, valueBtc)
        this.available = available
        this.marginHold = marginHold
        this.pnl = pnl
      }
}
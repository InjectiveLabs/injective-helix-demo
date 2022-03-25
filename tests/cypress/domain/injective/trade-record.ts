import Amount from "./amount"
import { Coin, Asset, AssetFactory } from "./assets"
import { Address } from "./blockchain"

export enum Side {
    BUY,
    SELL,
    LONG,
    SHORT
}

export enum OrderType {
    MARKET,
    LIMIT
}

export enum MarketType {
    SPOT,
    PERP
}

export enum PositionType {
    POSITION,
    DERIVATIVE_ORDER,
    SPOT_ORDER
}

export abstract class TradeRecord {
    constructor(readonly ticker: Ticker, readonly side: Side, readonly amount: number, readonly total: Amount) {
        this.ticker = ticker
        this.side = side
        this.amount = amount
        this.total = total
    }
}

export class Position extends TradeRecord {
    constructor(readonly ticker: Ticker,
        readonly side: Side,
        readonly entryPrice: Amount,
        readonly amount: number,
        readonly liquidationPrice: Amount,
        readonly unrealizedPnl: Amount,
        readonly total: Amount,
        readonly margin: number,
        readonly leverage: number,
    ) {
        super(ticker, side, amount, total)
        this.entryPrice = entryPrice
        this.liquidationPrice = liquidationPrice
        this.unrealizedPnl = unrealizedPnl
        this.margin = margin
        this.leverage = leverage
    }
}

export class FundingPayment {
    constructor(readonly time: String, readonly ticker: Ticker, readonly payment: Amount) {
        this.time = time
        this.ticker = ticker
        this.payment = payment
    }
}

export class SpotOrder extends TradeRecord {
    constructor(
        readonly ticker: Ticker,
        readonly side: Side,
        readonly price: Amount,
        readonly amount: number,
        readonly unfilled: number,
        readonly filled: number,
        readonly total: Amount,
    ) {
        super(ticker, side, amount, total)
        this.price = price
        this.unfilled = unfilled
        this.filled = filled
    }
}

export class DerivativeOrder extends SpotOrder {
    constructor(
        readonly ticker: Ticker,
        readonly side: Side,
        readonly price: Amount,
        readonly amount: number,
        readonly unfilled: number,
        readonly filled: number,
        readonly leverage: number,
        readonly total: Amount,
        readonly hash: string = null
    ) {
        super(ticker, side, price, amount, unfilled, filled, total)
        this.leverage = leverage
        this.hash = hash
    }
}

export class HistoricalOrder extends TradeRecord {
    constructor(
        readonly time: string,
        readonly ticker: Ticker,
        readonly type: OrderType,
        readonly side: Side,
        readonly price: Amount,
        readonly amount: number,
        readonly fee: Amount,
        readonly total: Amount,
    ) {
        super(ticker, side, amount, total)
        this.type = type
        this.price = price
        this.fee = fee
    }
}

export class WalletOperation {
    constructor(
        readonly time: string,
        readonly type: string,
        readonly asset: Asset,
        readonly amount: Amount,
        readonly origin: Address,
        readonly destination: Address
    ) {
        this.time = time
        this.type = type
        this.asset = asset
        this.amount = new Amount(amount.asset, this.trimDecimals(amount.value))
        this.origin = origin
        this.destination = destination
    }

    toString(): string {
        return `${this.type}: ${this.amount} from ${this.origin} to ${this.destination}`
    }

    private trimDecimals(value: string): string {
        let index = value.indexOf('.')
        if (index === -1) {
            return value
        }

        if (value.length - index + 3 <= 0) {
            return value
        }

        return value.substring(0, index + 3)
    }
}

export class Ticker {
    constructor(readonly baseAsset: Coin, readonly quoteAsset: Coin, readonly marketType: MarketType) {
        this.baseAsset = baseAsset
        this.quoteAsset = quoteAsset
        this.marketType = marketType
    }

    toString(): string {
        let type = ''
        if (this.marketType == MarketType.PERP) { type = ' PERP' }
        return `${this.baseAsset.name.toUpperCase()}/${this.quoteAsset.name.toUpperCase()}${type}`
    }
}

export class TickerFactory {
    static fromText(ticker: string): Ticker {
        let coins = ticker.trim().split('/')
        if (coins.length < 2) {
            throw new Error(`Incorrectly formatted ticker '${ticker}'`)
        }

        let types = coins[1].split(' ')
        let type = MarketType.SPOT
        if (types.length === 2) {
            type = MarketType.PERP
            coins[1] = types[0]
        }

        return new Ticker(AssetFactory.fromText(coins[0]) as Coin, AssetFactory.fromText(coins[1]) as Coin, type)
    }
}

export class SideFactory {
    static fromText(text: string): Side {
        text = text.toLowerCase().trim()

        if (text === 'buy') {
            return Side.BUY
        } else if (text == 'sell') {
            return Side.SELL
        } else if (text == 'long') {
            return Side.LONG
        } else {
            return Side.SHORT
        }

        throw new Error(`Unknown trade side: ${text}`)
    }
}
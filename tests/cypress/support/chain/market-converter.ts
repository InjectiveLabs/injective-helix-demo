import { Network } from '@injectivelabs/networks'
import { SpotMarketConsumer } from '@injectivelabs/spot-consumer'
import { getUrlEndpointForNetwork, UrlEndpoint } from '@injectivelabs/networks'
import { DerivativeMarketInfo, DerivativeLimitOrder } from '@injectivelabs/exchange-api/injective_derivative_exchange_rpc_pb'
import { SpotMarketInfo } from '@injectivelabs/exchange-api/injective_spot_exchange_rpc_pb.d'
import { TickerFactory } from "../../domain/injective/trade-record"
import { DerivativeMarketConsumer } from "@injectivelabs/derivatives-consumer"

export class MarketConverter {
    private static derivativeMarkets = new Array<DerivativeMarketInfo>()
    private static spotMarkets = new Array<SpotMarketInfo>()
    private endpoint: UrlEndpoint

    constructor(readonly network: Network) {
        this.network = network
        this.endpoint = getUrlEndpointForNetwork(network)
    }

    async toPair(marketId: string) {
        await this.fetchDataIfNotPresent()

        for (var m of MarketConverter.derivativeMarkets) {
            if (m.getMarketId().toLowerCase() === marketId.toLowerCase()) {
                return TickerFactory.fromText(m.getTicker())
            }
        }

        for (var n of MarketConverter.spotMarkets) {
            if (n.getMarketId().toLowerCase() === marketId.toLowerCase()) {
                return TickerFactory.fromText(n.getTicker())
            }
        }

        throw new Error(`No ticker for marketId '${marketId}' found`)
    }

    async toMarketId(pair: Pair) {
        await this.fetchDataIfNotPresent()
        let ticker = pair.toString()
        for (var m of MarketConverter.derivativeMarkets) {
            if (m.getTicker().toLowerCase() === ticker.toLowerCase()) {
                return m.getMarketId()
            }
        }

        for (var n of MarketConverter.spotMarkets) {
            if (n.getTicker().toLowerCase() === ticker.toLowerCase()) {
                return n.getMarketId()
            }
        }

        throw new Error(`No market for ticker '${ticker}' found`)
    }

    async fetchDataIfNotPresent() {
        if (MarketConverter.derivativeMarkets.length === 0 || MarketConverter.spotMarkets.length === 0) {
            let derClient = new DerivativeMarketConsumer(this.endpoint.exchangeApi)
            let markets = await derClient.fetchMarkets()
            markets.forEach(it => { MarketConverter.derivativeMarkets.push(it) })

            let spotClient = new SpotMarketConsumer(this.endpoint.exchangeApi)
            let spot = await spotClient.fetchMarkets()
            spot.forEach(it => { MarketConverter.spotMarkets.push(it) })
        }
    }
}
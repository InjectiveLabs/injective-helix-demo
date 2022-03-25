import UnitConverter from '../chain/unit-converter'
import { Network } from "@injectivelabs/networks";
import { MAKERS_FEE } from "../constants";
import { Ticker } from '../../domain/injective/trade-record';

export class MarginHelper {
    private unitConverter = new UnitConverter()

    constructor(readonly network: Network) {
        this.network = network
    }

    getExpectedMarginHold(order: any, ticker: Ticker): number {
        let margin = Number(order.getMargin()) + (Number(order.getPrice()) * Number(order.getQuantity())) * MAKERS_FEE
        return this.unitConverter.fromBase(ticker.quoteAsset, margin)
    }
}
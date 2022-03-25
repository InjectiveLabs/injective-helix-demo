import { DerivativeLimitOrder, DerivativePosition } from '@injectivelabs/exchange-api/injective_derivative_exchange_rpc_pb'
import { SpotLimitOrder } from '@injectivelabs/exchange-api/injective_spot_exchange_rpc_pb'
import { ENDPOINT, NETWORK } from '../constants'
import { MarginHelper } from '../../support/helpers/margin-helper'
import { MarketConverter } from "../../support/chain/market-converter"
import { DerivativeMarketConsumer } from "@injectivelabs/derivatives-consumer"
import { Address, Network } from "../../domain/injective/blockchain"
import { AddressHelper } from "../../support/helpers/address-helper"
import { DerivativeOrder, Position, SideFactory, SpotOrder } from "../../domain/injective/trade-record"
import UnitConverter from '../chain/unit-converter'
import Amount from '../../domain/injective/amount'
import { SpotMarketConsumer } from '@injectivelabs/spot-consumer'

let marginHelper = new MarginHelper(NETWORK)
let marketConverter = new MarketConverter(NETWORK)
let unitConverter = new UnitConverter()
let derivativeClient = new DerivativeMarketConsumer(ENDPOINT.exchangeApi)
let spotClient = new SpotMarketConsumer(ENDPOINT.exchangeApi)

export async function calculateExpectedMarginReturn(order: DerivativeLimitOrder) {
    let ticker = await marketConverter.toPair(order.getMarketId())
    return marginHelper.getExpectedMarginHold(order, ticker)
}

export function fetchDerivativeOrders() {
    cy.get('@walletAddressRaw').then((raw: unknown) => {
        let addressHelper = new AddressHelper()
        cy.wrap(null).then(async () => {
          let rawOrders = await derivativeClient.fetchOrders({ subaccountId: addressHelper.toSubaccountAddress(new Address(raw as string, Network.ETHEREUM)).value })
          return rawOrders
        }).as('apiDerivativeOrders')
    })
}

export function transformDerivativeOrders() {
    cy.get('@apiDerivativeOrders').then(async (raw: any) => {
        let rawOrders = raw as Array<DerivativeLimitOrder>
        let orders = new Array<DerivativeOrder>()
        for (var rawOrder of rawOrders) {
            let ticker = await marketConverter.toPair(rawOrder.getMarketId())
            let total = Number(rawOrder.getPrice()) * Number(rawOrder.getQuantity())
            orders.push(new DerivativeOrder(
                ticker,
                SideFactory.fromText(rawOrder.getOrderSide()),
                new Amount(ticker.quoteAsset, unitConverter.fromBase(ticker.quoteAsset, Number(rawOrder.getPrice())).trimDecimals(3).toString()),
                Number(rawOrder.getQuantity()),
                Number(rawOrder.getUnfilledQuantity()),
                Number(rawOrder.getQuantity()) - Number(rawOrder.getUnfilledQuantity()),
                null,
                new Amount(ticker.quoteAsset, unitConverter.fromBase(ticker.quoteAsset, Number(total)).trimDecimals(3).toString())))
        }
        return orders
      }).as('expectedDerivativeOrders')
}

export function fetchSpotOrders() {
    cy.get('@walletAddressRaw').then((raw: unknown) => {
        let addressHelper = new AddressHelper()
        cy.wrap(null).then(async () => {
          let rawOrders = await spotClient.fetchOrders({ subaccountId: addressHelper.toSubaccountAddress(new Address(raw as string, Network.ETHEREUM)).value })
          return rawOrders
        }).as('apiSpotOrders')
    })
}

export function transformSpotOrders() {
    cy.get('@apiSpotOrders').then(async (raw: any) => {
        let rawOrders = raw as Array<SpotLimitOrder>
        let orders = new Array<SpotOrder>()
        for (var rawOrder of rawOrders) {
            let ticker = await marketConverter.toPair(rawOrder.getMarketId())
            let price = unitConverter.fromApiSpotPrice(Number(rawOrder.getPrice()))
            let quantity = unitConverter.fromBase(ticker.baseAsset, Number(rawOrder.getQuantity()))
            let unfulfilled = unitConverter.fromBase(ticker.baseAsset, Number(rawOrder.getUnfilledQuantity()))
            let total = price *quantity

            orders.push(new SpotOrder(
                ticker,
                SideFactory.fromText(rawOrder.getOrderSide()),
                new Amount(ticker.quoteAsset, price.toFixed(3).toString()),
                quantity,
                unfulfilled,
                quantity - unfulfilled,
                new Amount(ticker.quoteAsset, total.toFixed(3).toString())))
        }
        return orders
      }).as('expectedSpotOrders')
}

export function fetchPositions() {
    cy.get('@walletAddressRaw').then((raw: unknown) => {
        let addressHelper = new AddressHelper()
        cy.wrap(null).then(async () => {
          let rawPositions = await derivativeClient.fetchPositions({ subaccountId: addressHelper.toSubaccountAddress(new Address(raw as string, Network.ETHEREUM)).value })
          return rawPositions
        }).as('apiPositions')
    })
}

export function transformPositions() {
    cy.get('@apiPositions').then(async (raw: any) => {
        let rawPositions = raw as Array<DerivativePosition>
        let positions = new Array<Position>()
        for (var rawPosition of rawPositions) {
            let ticker = await marketConverter.toPair(rawPosition.getMarketId())
            let total = Number(rawPosition.getMarkPrice()) * Number(rawPosition.getQuantity())
            let liquidationPrice = unitConverter.fromBase(ticker.quoteAsset, Number(rawPosition.getLiquidationPrice()))
            if (Number(rawPosition.getLiquidationPrice()) <= 0) {
                liquidationPrice = 0
            }
            console.log(`liquidationPrice: ${liquidationPrice}`)
            positions.push(new Position(
                ticker,
                SideFactory.fromText(rawPosition.getDirection()),
                new Amount(ticker.quoteAsset, unitConverter.fromBase(ticker.quoteAsset, Number(rawPosition.getEntryPrice())).trimDecimals(3).toString()),
                Number(rawPosition.getQuantity()),
                new Amount(ticker.quoteAsset, liquidationPrice.trimDecimals(3).toString()),
                null,
                new Amount(ticker.quoteAsset, unitConverter.fromBase(ticker.quoteAsset, total).trimDecimals(3).toString()),
                Number(unitConverter.fromBase(ticker.quoteAsset, Number(rawPosition.getMargin()))).trimDecimals(3),
                null))
        }
        return positions
      }).as('expectedPositions')
}

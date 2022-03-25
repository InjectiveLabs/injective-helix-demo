import { OrderType, PositionType, Side, SpotOrder, Ticker } from "../../domain/injective/trade-record";
import HeaderPart from "../../pages/injective/exchange/header-part";
import { DeviationModal, SpotMarketPage, Tabs } from "../../pages/injective/exchange/market-page";

let header = new HeaderPart()
let marketPage: SpotMarketPage = new SpotMarketPage()

export function openMarket(ticker: Ticker) {
    header.navigateToMarket(ticker)
}

export function openMarketAndExecuteTrade(ticker: Ticker, side: Side, orderType: OrderType, amount: string, price: string = null) {
    openMarket(ticker)

    if (side === Side.SELL || side === Side.SHORT) {
        throw new Error('Not implemented')
    }

    marketPage.switchToOrderType(orderType)
    marketPage.enterAmount(amount)

    if (orderType === OrderType.LIMIT) {
        marketPage.enterPrice(price)
    }

    marketPage.clickExecuteTrade()

    cy.confirmMetamaskSignatureRequest()
    cy.get('.toasted.success').should('be.visible')
}

export function openMarketAndPlaceRestingOrder(ticker: Ticker, side: Side, positionType: PositionType, amount: string, leverage: string = null) {
    openMarket(ticker)

    if (side === Side.SELL || side === Side.SHORT) {
        throw new Error('Not implemented')
    }

    marketPage.assertHasSomeTradingAccountBalances()
    marketPage.switchToOrderType(OrderType.LIMIT)
    if (positionType === PositionType.DERIVATIVE_ORDER && leverage) {
        marketPage.enterLeverage(leverage)
    }

    marketPage.enterAmount(amount)
    marketPage.enterRestingPrice()
    marketPage.clickExecuteTrade()

    cy.confirmMetamaskSignatureRequest()
    cy.assertSuccessToastWithText('Your order has been placed')

    if (positionType === PositionType.DERIVATIVE_ORDER) {
        marketPage.switchToTab(Tabs.OPEN_ORDERS)
        cy.waitUntil(() => {
            marketPage.fetchEntries(positionType)
            return cy.get('@openOrders').then((o1: unknown) => {
                let orders = o1 as Array<SpotOrder>
                orders.filter((v: SpotOrder) => {
                    return v.ticker === ticker && v.side == side && v.amount.toString() === amount
                }).length >= 1
            })
            }, {timeout: 10000, interval: 1000})
    } else if (positionType === PositionType.SPOT_ORDER) {
        cy.waitUntil(() => {
            marketPage.fetchEntries(positionType)
            return cy.get('@openOrders').then((o1: unknown) => {
                let orders = o1 as Array<SpotOrder>
                orders.filter((v: SpotOrder) => {
                    return v.ticker === ticker && v.side == side && v.amount.toString() === amount
                }).length >= 1
            })
            }, {timeout: 10000, interval: 1000})
    } else {
        throw new Error(`Cannot place resting order for ${positionType}`)
    }
}

export function openMarketAndOpenAposition(ticker: Ticker, side: Side, leverage: string, amount: string) {
    openMarket(ticker)
    if (side === Side.SELL || side === Side.SHORT) {
        throw new Error('Not implemented')
    }

    marketPage.enterAmount(amount)
    marketPage.enterLeverage(leverage)

    marketPage.clickExecuteTrade()
    cy.isMetamaskNotificationDisplayed()

    cy.confirmMetamaskSignatureRequest()
    cy.assertSuccessToastWithText('trade placed')

    cy.waitUntil(() => {
        marketPage.fetchEntries(PositionType.POSITION)
        return cy.get('@openPositions').then((o1: unknown) => {
            let orders = o1 as Array<SpotOrder>
            orders.filter((v: SpotOrder) => {
                return v.ticker === ticker && v.side == side && v.amount.toString() === amount
            }).length >= 1
        })
        }, {timeout: 10000, interval: 1000})
}
import { OrderType, PositionType, SpotOrder } from "../../../domain/injective/trade-record";
import SpotOrderComponent from "./partials/spot-orders-component";
import PositionsComponent from "./partials/positions-component";
import { BaseInjectivePage } from "./universal";

export enum Tabs {
    OPEN_POSITIONS,
    OPEN_ORDERS,
    TRADE_HISTORY
}

export class SpotMarketPage extends BaseInjectivePage {
    readonly tradeAmountCy = 'trade-amount-input'
    readonly executeTradeButtonCy = 'trade-execute-button'
    readonly tradeLimitButtonCy = 'trade-switch-to-limit-button'
    readonly tradeMarketButtonCy = 'trade-switch-to-market-button'
    readonly tradePriceInputCy = 'trade-price-input'
    readonly tradeLeverageInputCy = 'trade-leverage-input'
    readonly lastTradedPriceCy = 'orderbook-last-traded-price'
    readonly tradingBalancesCy = 'trade-trading-account-balances'

    private spotOrderComponent = new SpotOrderComponent()
    private positionsComponent = new PositionsComponent()

    enterAmount(amount: string) {
        cy.getByDataCy(this.tradeAmountCy).clear().type(amount)
    }

    enterPrice(price: string) {
        cy.getByDataCy(this.tradePriceInputCy).type(price)
    }

    enterLeverage(leverage: string) {
        cy.getByDataCy(this.tradeLeverageInputCy).clear().realType(leverage.replace('.0', '.').replace('.', ','))
    }

    enterRestingPrice() {
        cy.getByDataCy(this.lastTradedPriceCy).invoke('text').then((t: string) => {
            if (t === undefined || t.length === 0) {
                throw new Error('No last traded price found')
            }

            t = t.replace(',', '')

            let priceToEnter = (Number(t) - Number(t) * 0.2).toFixed(3)
            cy.log(`price that will be used for resting order: ${priceToEnter}`)

            this.enterPrice(priceToEnter.toString())
        })
    }

    switchToOrderType(type: OrderType) {
        if (type === OrderType.LIMIT) {
            cy.getByDataCy(this.tradeLimitButtonCy).click()
        } else {
            cy.getByDataCy(this.tradeMarketButtonCy).click()
        }
    }

    clickExecuteTrade() {
        cy.getByDataCy(this.executeTradeButtonCy).click()
    }

    fetchEntries(type: PositionType, limit: number = null) {
        if (type === PositionType.SPOT_ORDER || type === PositionType.DERIVATIVE_ORDER) {
            this.spotOrderComponent.fetchEntries(limit)
        } else if (type === PositionType.POSITION) {
            this.positionsComponent.fetchEntries(limit)
        }
    }

    switchToTab(tab: Tabs) {
        let text: string
        if (tab === Tabs.OPEN_POSITIONS) {
            text = 'open-positions'
        } else if (tab === Tabs.OPEN_ORDERS) {
            text = 'open-orders'
        } else {
            text = 'trade-history'
        }
        cy.getByDataCy(`trade-${text}-tab-button`).click()
    }

    assertHasSomeTradingAccountBalances() {
        cy.getByDataCy(this.tradingBalancesCy).should('be.visible')
    }
}

export class DeviationModal {
    readonly confirmButtonCy = 'modal-price-deviation-confirm-button'

    clickConfirm() {
        cy.getByDataCy(this.confirmButtonCy).click()
    }
}
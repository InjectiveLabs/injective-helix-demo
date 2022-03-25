import { Address } from "../../../domain/injective/blockchain"
import { AssetFactory } from "../../../domain/injective/assets"
import Amount from "../../../domain/injective/amount"
import { Side, Position, SpotOrder, DerivativeOrder, WalletOperation, TickerFactory, SideFactory, Ticker } from "../../../domain/injective/trade-record"
import { BaseInjectivePage } from './universal'
import { NetworkHelper } from '../../../support/helpers/address-helper'
import SpotOrderComponent from "./partials/spot-orders-component"
import PositionsComponent from "./partials/positions-component"

export enum ActivityTabs {
    POSITIONS,
    SPOT_ORDERS,
    DERIVATIVE_ORDERS,
    WALLET_HISTORY
}

export class ActivityPage extends BaseInjectivePage {
     open() {
        this.header.clickOnActivity()
        // cy.intercept('POST', '/injective_derivative_exchange_rpc.InjectiveDerivativeExchangeRPC/Markets').as('Markets')
        // cy.intercept('POST', '/injective_derivative_exchange_rpc.InjectiveDerivativeExchangeRPC/StreamPositions').as('StreamPositions')
        // cy.intercept('POST', '/injective_derivative_exchange_rpc.InjectiveDerivativeExchangeRPC/StreamOrders').as('StreamOrders')
        // cy.intercept('POST', '/injective_derivative_exchange_rpc.InjectiveDerivativeExchangeRPC/Positions').as('Positions')
        // cy.wait(['@Markets', '@StreamPositions', '@StreamOrders', '@Positions'])
        // cy.wait(['@Markets'])
    }

    selectTab(tab: ActivityTabs) {
        let name: string
        let toAwait = new Array<string>()
        cy.intercept('POST', '/injective_derivative_exchange_rpc.InjectiveDerivativeExchangeRPC/Orders').as('Orders')
        cy.intercept('OPTIONS', '/injective_derivative_exchange_rpc.InjectiveDerivativeExchangeRPC/StreamOrders').as('OptionsStreamOrders')
        cy.intercept('OPTIONS', '/injective_derivative_exchange_rpc.InjectiveDerivativeExchangeRPC/StreamTrades').as('OptionsStreamTrades')
        cy.intercept('POST', '/injective_accounts_rpc.InjectiveAccountsRPC/SubaccountHistory').as('SubaccountHistory')
        switch(tab) {
            case ActivityTabs.POSITIONS:
                name = 'positions'
                toAwait = ['@Positions']
                break
            case ActivityTabs.SPOT_ORDERS:
                name = 'spot'
                toAwait = ['@Orderbook']
                break
            case ActivityTabs.DERIVATIVE_ORDERS:
                name = 'derivatives'
                toAwait = ['@Orders', '@OptionsStreamOrders', '@OptionsStreamTrades']
                break
            case ActivityTabs.WALLET_HISTORY:
                toAwait = ['@SubaccountHistory']
                name = 'wallet'
                break
            default:
                throw new Error(`Unsupported tab: ${tab}`)
        }

        cy.getByDataCy(`${name}-panel`).click()
        cy.wait(toAwait)
    }
}

abstract class ActivityTab<T> {
    readonly cancelAllCy = 'cancel-all-button'

    clickCancelAll() {
        cy.getByDataCy(this.cancelAllCy).click()
    }

    filterByAsset(text: string) {

    }

    filterBySide(side: Side) {

    }

    cancelEntryOnPosition(position: number) {
        cy.getByContainingDataCy('-row-').each(($e, i, _) => {
            if (i +1 == position) {
                cy.wrap($e.find(`[data-cy*=cancel-link]`)).click()
                return
            }
        })
    }

    cancelEntryWithTicker(ticker: Ticker) {
        cy.getByContainingDataCy('-row-').each(($e, i, _) => {
            if ($e.find('[data-cy*=ticker]').text().toLowerCase().indexOf(ticker.toString().toLowerCase()) > -1) {
                cy.wrap($e.find(`[data-cy*=cancel-link]`)).click()
                return
            }
        })
    }

    abstract fetchEntries(): void
}

export class PositionsTab extends ActivityTab<Position> {
    readonly openPositionsLinkCy = 'activity-positions-positions-link'
    readonly fundingPaymentsLinkCy = 'activity-positions-fundingPayments-link'
    readonly positionCancelLinkCy = 'position-entry-cancel-link'
    readonly positionAddMarginButtonCy = 'position-entry-add-margin-button'
    private positionsComponent = new PositionsComponent()

    clickOnOpenPositions() {
        cy.intercept('POST', '/injective_derivative_exchange_rpc.InjectiveDerivativeExchangeRPC/Positions').as('Positions')
        cy.getByDataCy(this.openPositionsLinkCy).click()
        cy.wait('@Positions')
    }

    clickOnFundingPayments() {
        cy.intercept('POST', '/injective_derivative_exchange_rpc.InjectiveDerivativeExchangeRPC/FundingPayments').as('FundingPayments')
        cy.getByDataCy(this.fundingPaymentsLinkCy).click()
        cy.wait('@FundingPayments')
    }

    clickIncreaseMarginOnPosition(order: number) {

    }

    override fetchEntries(limit: number = null) {
       this.positionsComponent.fetchEntries(limit)
    }
}

export class SpotOrdersTab extends ActivityTab<SpotOrder> {
    readonly openOrdersLinkCy = 'activity-spot-orders-link'
    readonly tradeHistoryLinkCy = 'activity-spot-trades-link'
    readonly orderCancelLinkCy = 'order-entry-cancel-link'
    private spotOrderComponent = new SpotOrderComponent()

    clickOnOpenOrders() {
        cy.intercept('POST', '/injective_derivative_exchange_rpc.InjectiveSpotExchangeRPC/Orders').as('Orders')
        cy.getByDataCy(this.openOrdersLinkCy).click()
        cy.wait('@Orders')
    }

    clickOnTradeHistory() {
        cy.getByDataCy(this.tradeHistoryLinkCy).click()
    }


    override fetchEntries(limit: number = null) {
        this.spotOrderComponent.fetchEntries(limit)
    }
}

export class DerivativeOrdersTab extends ActivityTab<DerivativeOrder> {
    readonly openOrdersLinkCy = 'activity-derivative-orders-link'
    readonly tradeHistoryLinkCy = 'activity-derivative-trades-link'
    readonly orderCancelLinkCy = 'order-entry-cancel-link'
    readonly rowCy = 'order-row'
    readonly pairCy = 'order-entry-ticker'
    readonly sideCy = 'order-entry-side'
    readonly priceCy = 'order-entry-price'
    readonly amountCy = 'order-entry-quantity'
    readonly unfilledCy = 'order-entry-unfilled'
    readonly filledCy = 'order-entry-filled'
    readonly leverageCy = 'order-entry-leverage'
    readonly totalCy = 'order-entry-total'

    clickOnOpenOrders() {
        cy.intercept('POST', '/injective_derivative_exchange_rpc.InjectiveDerivativeExchangeRPC/Orders').as('Orders')
        cy.getByDataCy(this.openOrdersLinkCy).click()
        cy.wait('@Orders')
    }

    clickOnTradeHistory() {
        cy.getByDataCy(this.tradeHistoryLinkCy).click()
    }

    override fetchEntries(limit: number = null) {
        let operations = new Array<DerivativeOrder>()
        cy.getByContainingDataCy(this.rowCy).each(($e, i, _) => {
            if (!limit || (limit && i++ < limit)) {
                return new Cypress.Promise(resolve => {
                    let pairText = $e.find(`[data-cy=${this.pairCy}]`).text().trim()
                    let side = $e.find(`[data-cy=${this.sideCy}]`).text().onlyLetters()
                    let price = $e.find(`[data-cy=${this.priceCy}]`).text().onlyNumbers()
                    let amount = $e.find(`[data-cy=${this.amountCy}]`).text().onlyNumbers()
                    let unfilled = $e.find(`[data-cy=${this.unfilledCy}]`).text().onlyNumbers()
                    let filled = $e.find(`[data-cy=${this.filledCy}]`).text().onlyNumbers()
                    let leverage = $e.find(`[data-cy=${this.leverageCy}]`).text().onlyNumbers()
                    let total = $e.find(`[data-cy=${this.totalCy}]`).text().onlyNumbers()
                    // let hash = $e.attr('data-cy-hash').trim()

                    let ticker = TickerFactory.fromText(pairText)
                    resolve(new DerivativeOrder(
                        ticker,
                        SideFactory.fromText(side),
                        new Amount(ticker.quoteAsset, price),
                        Number(amount),
                        Number(unfilled),
                        Number(filled),
                        null,
                        //Number(leverage),
                        new Amount(ticker.quoteAsset, total),
                        // hash
                        ))
                }).then((entry: DerivativeOrder) => {
                    operations.push(entry)
                })
            }
        }).then(() => {
            cy.wrap(operations).as('openDerivativeOrders')
        })
    }

    clickCancelOneOnPosition(position: number) {
        cy.getByContainingDataCy(this.rowCy).each(($e, i, _) => {
            if (i +1 == position) {
                cy.wrap($e.find(`[data-cy=${this.orderCancelLinkCy}]`)).click()
            }
        })
    }

    clickCancelOne(order: DerivativeOrder) {
        if (!order.hash) {
            throw new Error('Cannot cancel an order without a hash')
        }

        cy.intercept('POST', '/injective_exchange_rpc.InjectiveExchangeRPC/PrepareTx').as('PrepareTx')
        cy.getByDataCyHash(order.hash).findByDataCy(this.orderCancelLinkCy).click().then(() => {
            cy.wait('@PrepareTx')
        })
    }
}

export class WalletHistoryTab extends ActivityTab<WalletOperation> {
    readonly rowCy = 'history-row'
    readonly timeCy = 'history-entry-time'
    readonly typeCy = 'history-entry-type'
    readonly assetCy = 'history-entry-asset'
    readonly amountCy = 'history-entry-amount'
    readonly senderCy = 'history-entry-sender'
    readonly receiverCy = 'history-entry-receiver'
    private networkHelper = new NetworkHelper()

    clickOnTransfers(): WalletHistoryTab {
        return null
    }

    clickOnDeposits(): WalletHistoryTab {
        return null
    }

    clickOnWithdrawals(): WalletHistoryTab {
        return null
    }


    override fetchEntries(limit: number = null) {
        let operations = new Array<WalletOperation>()
        cy.getByContainingDataCy(this.rowCy).each(($e, i, list) => {
            if (!limit || (limit && i++ < limit)) {
                return new Cypress.Promise(resolve => {
                    let type = $e.find(`[data-cy=${this.typeCy}]`).text().trim()
                    let asset = $e.find(`[data-cy=${this.assetCy}]`).text().trim()
                    let coin = AssetFactory.fromText(asset)
                    let amount = $e.find(`[data-cy=${this.amountCy}]`).text().trim()
                    let sender = $e.find(`[data-cy=${this.senderCy}]`).text().trim()
                    let receiver = $e.find(`[data-cy=${this.receiverCy}]`).text().trim()
                    resolve(new WalletOperation(
                        '--',
                        type,
                        coin,
                        new Amount(coin, amount.onlyNumbers()),
                        new Address(sender, this.networkHelper.getNetwork(sender)),
                        new Address(receiver, this.networkHelper.getNetwork(receiver))))
                }).then((entry: WalletOperation) => {
                    operations.push(entry)
                })
            }
        }).then(() => {
            cy.wrap(operations).as('walletHistoryEntries')
        })
    }

    getExplorerLinkFor(entry: WalletOperation): string {
        return null
    }
}
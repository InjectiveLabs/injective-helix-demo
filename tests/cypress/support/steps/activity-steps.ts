import { ActivityTabs, WalletHistoryTab, DerivativeOrdersTab, PositionsTab, SpotOrdersTab } from "../../pages/injective/exchange/activity-page"
import { ActivityPage }  from "../../pages/injective/exchange/activity-page"
import { WalletOperation, DerivativeOrder, Position, Ticker, SpotOrder, PositionType } from "../../domain/injective/trade-record"
import PositionsComponent from "../../pages/injective/exchange/partials/positions-component"
import { AddMarginModal } from "../../pages/injective/exchange/trade-modals"
import Amount from "../../domain/injective/amount"
import { add } from "cypress/types/lodash"

let activityPage = new ActivityPage()
let historyTab = new WalletHistoryTab()
let spotOrdersTab = new SpotOrdersTab()
let derivativeOrdersTab = new DerivativeOrdersTab()
let positionsTab = new PositionsTab()
let positionsComponent = new PositionsComponent()
let addMarginModal = new AddMarginModal()

export function openActivity() {
    activityPage.open()
}

export function assertWalletHistoryHasEntries(expectedEntries: Array<WalletOperation>) {
    activityPage.open()
    activityPage.selectTab(ActivityTabs.WALLET_HISTORY)

    historyTab.fetchEntries(expectedEntries.length)

    cy.get('@walletHistoryEntries').then((en: unknown) => {
        let actualEntries = en as Array<WalletOperation>
        expect(actualEntries, 'Two transfer entries were found').to.have.lengthOf(expectedEntries.length)

        expect(actualEntries[0], 'Historical entry for transfer is correct').to.eqls(expectedEntries[0])
        expect(actualEntries[1], 'Historical entry for transfer is correct').to.eqls(expectedEntries[1])
    })
}

export function openActivityTab(tab: ActivityTabs) {
    openActivity()
    activityPage.selectTab(tab)
}

export function openActivityTabAndAssertItHasEntries(tab: ActivityTabs, expectedOrders: Array<any>) {
    openActivityTab(tab)
    assertTabHasEntries(tab, expectedOrders)
}

export function assertTabHasEntries(tab: ActivityTabs, expected: Array<any>) {
    if (tab === ActivityTabs.DERIVATIVE_ORDERS) {
        derivativeOrdersTab.fetchEntries(expected.length)

        cy.get('@openDerivativeOrders').then((o: unknown) => {
            let initialActualOrders = o as Array<DerivativeOrder>
            let sortFn = (first: DerivativeOrder, second: DerivativeOrder) => {
                return first.ticker.toString().localeCompare(second.ticker.toString())
            }
            initialActualOrders = initialActualOrders.sort(sortFn)
            expected = expected.sort(sortFn)

            expect(initialActualOrders.length, `User has ${expected.length} derivative orders opened`)

            for (var i = 0; i < expected.length; i++) {
            expect(initialActualOrders[i], `Order data is correct`).to.be.eql(expected[i])
            }
        })
    } else if (tab === ActivityTabs.POSITIONS) {
        positionsTab.fetchEntries(expected.length)

        cy.get('@openPositions').then((o: unknown) => {
            let initialActualOrders = o as Array<Position>
            let sortFn = (first: Position, second: Position) => {
                return first.ticker.toString().localeCompare(second.ticker.toString())
            }
            initialActualOrders = initialActualOrders.sort(sortFn)
            expected = expected.sort(sortFn)

            expect(initialActualOrders.length, `User has ${expected.length} positions opened`)

            for (var i = 0; i < expected.length; i++) {
            expect(initialActualOrders[i], `Position data is correct`).to.be.eql(expected[i])
            }
        })
    } else if (tab === ActivityTabs.SPOT_ORDERS) {
        spotOrdersTab.fetchEntries(expected.length)

        cy.get('@openOrders').then((o: unknown) => {
            let initialActualOrders = o as Array<SpotOrder>
            let sortFn = (first: SpotOrder, second: SpotOrder) => {
                return first.ticker.toString().localeCompare(second.ticker.toString())
            }
            initialActualOrders = initialActualOrders.sort(sortFn)
            expected = expected.sort(sortFn)

            expect(initialActualOrders.length, `User has ${expected.length} spot orders opened`)

            for (var i = 0; i < expected.length; i++) {
            expect(initialActualOrders[i], `Order data is correct`).to.be.eql(expected[i])
            }
        })
    }
}

export function cancelEntryOnPosition(position: number, positionType: PositionType) {
    derivativeOrdersTab.cancelEntryOnPosition(position)
    cy.intercept('POST', '/injective_exchange_rpc.InjectiveExchangeRPC/BroadcastTx').as('BroadcastTx')
    cy.confirmMetamaskSignatureRequest()
    cy.wait('@BroadcastTx')
    let toastText: string
    if (positionType == PositionType.POSITION) {
        toastText = 'Position closed'
    } else {
        toastText = 'Order cancelled'
    }
    cy.assertSuccessToastWithText(toastText)
}

export function cancelEntryWithTicker(ticker: Ticker, positionType: PositionType) {
    derivativeOrdersTab.cancelEntryWithTicker(ticker)
    cy.intercept('POST', '/injective_exchange_rpc.InjectiveExchangeRPC/BroadcastTx').as('BroadcastTx')
    cy.confirmMetamaskSignatureRequest()
    cy.wait('@BroadcastTx')
    cy.assertAnySuccessToast()
}

export function cancelAllEntries(positionType: PositionType) {
    derivativeOrdersTab.clickCancelAll()
    cy.intercept('POST', '/injective_exchange_rpc.InjectiveExchangeRPC/BroadcastTx').as('BroadcastTx')
    cy.confirmMetamaskSignatureRequest()
    cy.wait('@BroadcastTx')

    let toastText: string
    if (positionType == PositionType.POSITION) {
        toastText = 'Your positions have been closed'
    } else {
        toastText = 'Your orders have been cancelled'
    }
    cy.assertSuccessToastWithText(toastText)
}

export function assertEntryCountOnTabIsEqual(tab: ActivityTabs, expectedCount: number) {
    //streaming doesn't work, polling is slow?
    if (tab === ActivityTabs.DERIVATIVE_ORDERS) {
    cy.waitUntil(() => {
        derivativeOrdersTab.clickOnTradeHistory()
        derivativeOrdersTab.clickOnOpenOrders()
        derivativeOrdersTab.fetchEntries()
        cy.log(`expected length: ${expectedCount}`)
        return cy.get('@openDerivativeOrders').then((o1: unknown) => {
            let afterDeleteOrders = o1 as Array<DerivativeOrder>
            return afterDeleteOrders.length == expectedCount
        })
        }, {timeout: 10000, interval: 1000})
    } else if (tab === ActivityTabs.POSITIONS) {
        cy.waitUntil(() => {
            positionsTab.clickOnFundingPayments()
            positionsTab.clickOnOpenPositions()
            positionsTab.fetchEntries()
            return cy.get('@openPositions').then((o1: unknown) => {
                let afterDeleteOrders = o1 as Array<DerivativeOrder>
                return afterDeleteOrders.length == expectedCount
            })
            }, {timeout: 10000, interval: 1000})
    }
}

export function assertThereAreNoEntriesOnTab(tab: ActivityTabs) {
    if (tab === ActivityTabs.DERIVATIVE_ORDERS) {
        cy.waitUntil(() => {
            derivativeOrdersTab.clickOnTradeHistory()
            derivativeOrdersTab.clickOnOpenOrders()
            return cy.getByContainingDataCy(derivativeOrdersTab.rowCy).should('not.exist').then(() => {
                return true
            })
        }, {timeout: 10000, interval: 1000})
    } else if (tab === ActivityTabs.POSITIONS) {
        cy.waitUntil(() => {
            positionsTab.clickOnFundingPayments()
            positionsTab.clickOnOpenPositions()
            return cy.getByContainingDataCy(positionsComponent.rowCy).should('not.exist').then(() => {
                return true
            })
        }, {timeout: 10000, interval: 1000})
    }
}

export function increaseMarginBy(ticker: Ticker, marginIncrease: number) {
    positionsComponent.clickAddMarginButton(ticker)
    addMarginModal.fetchAvailableMargin()
    cy.get('@addMarginAvailable').then((av: any) => {
        let available = av as Amount

        if (marginIncrease > available.getValueAsNumber()) {
            throw new Error(`Cannot increase margin by ${marginIncrease}, only ${available.getValueAsNumber()} is available`)
        }

        addMarginModal.enterAmount(marginIncrease.toFixed(3))
        addMarginModal.clickAddMargin()
        cy.confirmMetamaskSignatureRequest()
        cy.assertSuccessToastWithText('You have successfully added margin to your position')
    })
}
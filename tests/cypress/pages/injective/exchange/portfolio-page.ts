import { WalletBalances, TradingAccountBalances, AccountSummary, AssetBalance, TradingBalance } from "../../../domain/injective/account-balances"
import Amount from "../../../domain/injective/amount"
import { USD, BTC, Coin, Asset, AssetFactory } from "../../../domain/injective/assets"
import { PrepareTransferModal } from "./transfer-modals"
import { BaseInjectivePage } from "./universal"

export class PortfolioPage extends BaseInjectivePage {
    readonly valueUsdCy = 'account-summary-usd-shown'
    readonly valueBtcCy = 'account-summary-btc'
    readonly walletPanelCy = 'wallet-panel'
    readonly tradingPanelCy = 'trading-panel'
    readonly walletTableCy = 'wallet-table-header'
    readonly transferButtonCy = 'account-summary-transfer'

     open() {
        this.header.clickOnPortfolio()
        cy.intercept('POST', '/injective_accounts_rpc.InjectiveAccountsRPC/SubaccountBalancesList').as('SubaccountBalancesList')
        cy.intercept('POST', '/cosmos.bank.v1beta1.Query/AllBalances').as('AllBalances')
        cy.intercept('POST', '/injective_accounts_rpc.InjectiveAccountsRPC/SubaccountsList').as('SubaccountsList')
        cy.wait(['@SubaccountBalancesList'])
    }

    fetchAccountSummary() {
        cy.getByDataCy(this.valueUsdCy).invoke('text').then(usd => {
            cy.getByDataCy(this.valueBtcCy).invoke('text').then(btc => {
                return new AccountSummary(new Amount(USD, usd), new Amount(BTC, btc))
            }).as('accountSummary').then(() => {
                return
            })
        })
    }

    switchToWallet() {
        cy.getByDataCy(this.walletPanelCy).click()
        .then(() => {
            cy.intercept('POST', '/cosmos.bank.v1beta1.Query/AllBalances').as('AllBalances')
            cy.wait('@AllBalances')
        })
    }

    switchToTradingAccount() {
        cy.intercept('POST', '/injective_derivative_exchange_rpc.InjectiveDerivativeExchangeRPC/Orderbook').as('Orderbook')
        cy.intercept('POST', '/injective_derivative_exchange_rpc.InjectiveDerivativeExchangeRPC/Positions').as('Positions')
        cy.getByDataCy(this.tradingPanelCy).click()
        .then(() => {
            cy.wait(['@Orderbook', '@Orderbook', '@Orderbook', '@Positions'])
        })
    }

    clickTransfer() {
        cy.getByDataCy(this.transferButtonCy).click()
    }

    clickWithdraw() {
    }

    clickDeposit() {
    }
}

export abstract class PortfolioTab<R> {
    filterByAsset(text: string) {

    }

    clickHideSmallBalances() {

    }

    waitUnilLoaded() {
        //wait for spinner to disappear
        //or requests to finish
    }

    abstract fetchEntries()
}

export class WalletTab extends PortfolioTab<WalletBalances> {
    readonly walletBalanceCy = 'wallet-value-usd-shown'
    readonly walletRowCy = 'wallet-row'
    readonly assetColumnBy = 'wallet-entry-asset'
    readonly totalColumnBy = 'wallet-entry-total'
    readonly valueUsdColumnBy = 'wallet-entry-value-shown-usd'
    readonly valueBtcColumnBy = 'wallet-entry-value-shown-btc'

    override fetchEntries() {
        let balances = new Array<AssetBalance>()
        cy.getByContainingDataCy(this.walletRowCy).each(($e, i, list) => {
            return new Cypress.Promise(resolve => {
                let asset = $e.find(`[data-cy=${this.assetColumnBy}]`).text()
                let coin = AssetFactory.fromText(asset)
                let total = $e.find(`[data-cy=${this.totalColumnBy}]`).text()
                let usd = $e.find(`[data-cy=${this.valueUsdColumnBy}]`).text()
                let btc = $e.find(`[data-cy=${this.valueBtcColumnBy}]`).text()
                resolve(new AssetBalance(coin as Coin, new Amount(coin, total), new Amount(USD, usd), new Amount(BTC, btc)))
            }).then((balance: AssetBalance) => {
                balances.push(balance)
            })
            // cy.wrap(e).findByDataCy(this.assetColumnBy).invoke('text').then(asset => {
            //     cy.wrap(e).findByDataCy(this.totalColumnBy).invoke('text').then(total => {
            //         cy.wrap(e).findByDataCy(this.valueUsdColumnBy).invoke('text').then(usd => {
            //             cy.wrap(e).findByDataCy(this.valueBtcColumnBy).invoke('text').then(btc => {
            //                 let coin = AssetFactory.fromText(asset)
            //                 balances.push(new AssetBalance(coin as Coin, new Amount(coin, total), new Amount(USD, usd), new Amount(BTC, btc)))
            //             })
            //         })
            //     })
            // })
        }).then(() => {
            cy.getByDataCy(this.walletBalanceCy).invoke('text').then((wallet: unknown) => {
                let walletBlances = new WalletBalances(new Amount(USD, wallet as string), balances)
                cy.wrap(walletBlances).as('walletEntries')
                return
            })
        })
    }

    clickDeposit(asset: Coin): PrepareTransferModal {
        return null
    }

    clickWithdraw(asset: Coin): PrepareTransferModal {
        return null
    }

    clickTransfer(asset: Coin): PrepareTransferModal {
        return null
    }
}

export class TradingAccountTab extends PortfolioTab<TradingAccountBalances> {
    readonly tradingBalanceCy = 'trading-value-usd-shown'
    readonly tradingRowCy = 'trading-row'
    readonly tradingAssetCy = 'trading-entry-asset'
    readonly tradingTotalCy = 'trading-entry-total'
    readonly tradingAvailableCy = 'trading-entry-available-shown'
    readonly tradingMarginHoldCy = 'trading-entry-marginHold-shown'
    readonly tradingPnlCy = 'trading-entry-pnl-shown'
    readonly tradingValueUsdCy = 'trading-entry-value-shown-usd'
    readonly tradingBtcCy = 'trading-entry-value-shown-btc'
    readonly tradingBalanceTotalCy = 'trading-value-usd-shown'
    readonly tradingBalanceAvailableCy = 'trading-available-usd-shown'
    readonly tradingTransferLinkCy = 'trading-entry-transfer-link'

    override fetchEntries() {
        let balances = new Array<TradingBalance>()
        cy.getByContainingDataCy(this.tradingRowCy).each(($e, i, list) => {
            return new Cypress.Promise(resolve => {
                let asset = $e.find(`[data-cy=${this.tradingAssetCy}]`).text()
                let coin = AssetFactory.fromText(asset)
                let total = $e.find(`[data-cy=${this.tradingTotalCy}]`).text()
                let available = $e.find(`[data-cy=${this.tradingAvailableCy}]`).text()
                let margin = $e.find(`[data-cy=${this.tradingMarginHoldCy}]`).text()
                let pnl = $e.find(`[data-cy=${this.tradingPnlCy}]`).text()
                let usd = $e.find(`[data-cy=${this.tradingValueUsdCy}]`).text()
                let btc = $e.find(`[data-cy=${this.tradingBtcCy}]`).text()
                resolve(new TradingBalance(
                    coin as Coin,
                    new Amount(coin, total),
                    new Amount(coin, available),
                    new Amount(coin, margin),
                    new Amount(coin, pnl),
                    new Amount(USD, usd),
                    new Amount(BTC, btc)))
            }).then((balance: TradingBalance) => {
                balances.push(balance)
            })
        }).then(() => {
            cy.getByDataCy(this.tradingBalanceTotalCy).invoke('text').then((total: unknown) => {
                cy.getByDataCy(this.tradingBalanceAvailableCy).invoke('text').then((available: unknown) => {
                    let portfolioBlances = new TradingAccountBalances(new Amount(USD, total as string), new Amount(USD, available as string), balances)
                    cy.wrap(portfolioBlances).as('tradingEntries')
                    return
                })
            })
        })
    }

    clickTrade(asset: Coin) {
        return null
    }

    clickTransfer(asset: Asset) {
        cy.getByDataCy(`trading-row-${asset.name}`).findByDataCy(this.tradingTransferLinkCy).click()
    }
}
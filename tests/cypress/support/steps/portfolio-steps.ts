import { PortfolioPage, WalletTab, TradingAccountTab } from "../../pages/injective/exchange/portfolio-page";
import { AccountSummary, TradingAccountBalances, WalletBalances } from "../../domain/injective/account-balances"
import { Coin, Asset } from "../../domain/injective/assets";
import Amount from "../../domain/injective/amount"
import { ConfirmTransferModal, PrepareTransferModal, TrxConfirmedModal } from "../../pages/injective/exchange/transfer-modals"
import { TransferDirection } from "../../domain/injective/transaction-types"
import { TransferHelper } from '../helpers/transfer-helper'

let portfolioPage = new PortfolioPage()
let walletTab = new WalletTab()
let tradingBalanceTab = new TradingAccountTab()
let transferHelper = new TransferHelper()

export function openPortfolio() {
    portfolioPage.open()
}

export function assertSummmaryBalanceIsAboveZero() {
    portfolioPage.fetchAccountSummary()

    cy.get('@accountSummary').then((s: unknown) => {
      let summary = s as AccountSummary
       expect(summary.valueUsd.getValueAsNumber(), 'USD value of account is greater than $0').to.be.greaterThan(0)
       expect(summary.valueBtc.getValueAsNumber(), 'BTC value of account is greter than 0 BTC').to.be.greaterThan(0)
    })
}

export function assertWalletBalanceIsAtLeast(amount: Amount) {
    walletTab.fetchEntries()

    cy.get('@walletEntries').then((e: unknown) => {
        let balance = e as WalletBalances
        // let expectedInjBalance = 101
        // expect(balance.getBalance(INJ)?.total?.getValueAsNumber(), `Wallet INJ balance to be equal to ${expectedInjBalance}`).to.be.equal(expectedInjBalance)
        expect(balance.getBalance(amount.asset)?.total?.getValueAsNumber(), `Wallet ${amount.asset.name} balance to be greater or equal than ${amount.getValueAsNumber()}`).to.be.gte(amount.getValueAsNumber())
        expect(balance.walletValue.getValueAsNumber(), "Wallet USD value wasn't greater than $0").to.be.greaterThan(0)
    })
}

export function saveTradingAccountState() {
    portfolioPage.switchToTradingAccount()
    tradingBalanceTab.fetchEntries()
}

export function assertWalletBalancesChangedBy(transferred: Amount) {
    cy.get('@walletEntries').then((e: unknown) => {
        let oldBalances = e as WalletBalances
        portfolioPage.switchToWallet()
        walletTab.fetchEntries()

        cy.get('@walletEntries').then((n:  unknown) => {
          let newBalances = n as WalletBalances
          expect(newBalances.getBalance(transferred.asset).total.getValueAsNumber(), `${transferred.asset.name} balance in wallet changed by ${transferred.value}`).to.be.equal(oldBalances.getBalance(transferred.asset).total.getValueAsNumber() + transferred.getValueAsNumber())
          //might fail if USD exchange rate changes
          // expect(oldBalances.walletValue.getValueAsNumber(), "Wallet USD value hasn't decreased").to.be.lessThan(newBalances.walletValue.getValueAsNumber())
        })
    })
}

export function assertTradingBalancesChangedBy(transferred: Amount) {
    cy.get('@tradingEntries').then((o: unknown) => {
        let oldBalances = o as TradingAccountBalances
        portfolioPage.switchToTradingAccount()
        tradingBalanceTab.fetchEntries()

        cy.get('@tradingEntries').then((n: unknown) => {
          let newB = n as TradingAccountBalances
          let expectedBalance = oldBalances.getBalance(transferred.asset).total.getValueAsNumber() + transferred.getValueAsNumber()
          expect(newB.getBalance(transferred.asset).total.getValueAsNumber(), `Trading account ${transferred.asset.name} balance value is equal to ${expectedBalance}`).to.be.equal(expectedBalance)
        })
      })
}

export function transferViaTopButtonAndAssertSuccess(toTransfer: Amount, direction: TransferDirection) {
    transferByAndAssertSuccess(toTransfer, direction, () => { portfolioPage.clickTransfer() } )
}

export function transferViaTradingBalancesAndAssertSuccess(toTransfer: Amount, direction: TransferDirection) {
    transferByAndAssertSuccess(toTransfer, direction, () => { tradingBalanceTab.clickTransfer(toTransfer.asset) } )
}

function transferByAndAssertSuccess(toTransfer: Amount, direction: TransferDirection, transferEntryPoint: Function) {
    let fromText: string
    let toText = transferHelper.getText(direction)
    if (direction === TransferDirection.TO_TRADING_ACCOUNT) {
        fromText = transferHelper.getText(TransferDirection.TO_WALLET)
        portfolioPage.switchToWallet()
    } else {
        fromText = transferHelper.getText(TransferDirection.TO_TRADING_ACCOUNT)
        portfolioPage.switchToTradingAccount()
    }

    transferEntryPoint()
    let transferModal = new PrepareTransferModal()

    transferModal.fetchFrom()
    transferModal.fetchTo()
    cy.get('@transferFrom').then((from: unknown) => {
        cy.get('@transferTo').then((to: unknown) => {
          expect((from as string).trim(), 'Transfer direction is from wallet to trading account').to.be.equal(fromText)
          expect((to as string).trim(), 'Transfer direction is from wallet to trading account').to.be.equal(toText)
      })
    })

    //add asset selection
    transferModal.enterValue(toTransfer.value)
    transferModal.clickTransferNow()

    let confirmModal = new ConfirmTransferModal()
    confirmModal.fetchFrom()
    confirmModal.fetchTo()

    cy.get('@confirmFrom').then((from: unknown) => {
        cy.get('@confirmTo').then((to: unknown) => {
          expect((from as string).trim(), 'Transfer direction is from wallet to trading account').to.be.equal(fromText)
          expect((to as string).trim(), 'Transfer direction is from wallet to trading account').to.be.equal(toText)
      })
    })

    confirmModal.fetchValue()
    confirmModal.fetchUsdValue()
    cy.get('@confirmValue').then(v => {
        let value = v as unknown as Amount
        expect(value, `Transfer amount is equal to ${toTransfer}`).to.be.eql(toTransfer)
    })
    cy.get('@confirmUsdValue').then(v => {
      let value = v as unknown as Amount
      expect(value.getValueAsNumber(), 'Transfer amount is greater than $0').to.be.greaterThan(0)
    })

    confirmModal.clickConfirm()
    cy.confirmMetamaskSignatureRequest()
    let trxConfirmedModal = new TrxConfirmedModal()
    trxConfirmedModal.clickOk()
}

export function tryTotransferQuicklyAndRejectMesssage(toTransfer: Amount, direction: TransferDirection) {
    if (direction === TransferDirection.TO_TRADING_ACCOUNT) {
        portfolioPage.switchToWallet()
    } else {
        portfolioPage.switchToTradingAccount()
    }

    portfolioPage.clickTransfer()
    let transferModal = new PrepareTransferModal()

    if (direction === TransferDirection.TO_WALLET) {
        transferModal.clickSwitchDirection()
        let fromText = transferHelper.getText(TransferDirection.TO_TRADING_ACCOUNT)
        let toText = transferHelper.getText(direction)

        transferModal.fetchFrom()
        transferModal.fetchTo()
        cy.get('@transferFrom').then((from: unknown) => {
            cy.get('@transferTo').then((to: unknown) => {
              expect((from as string).trim(), 'Transfer direction is from wallet to trading account').to.be.equal(fromText)
              expect((to as string).trim(), 'Transfer direction is from wallet to trading account').to.be.equal(toText)
          })
        })
    }

    transferModal.enterValue(toTransfer.value)
    transferModal.clickTransferNow()

    let confirmModal = new ConfirmTransferModal()

    confirmModal.clickConfirm()
    cy.rejectMetamaskSignatureRequest()
}

export function tryTotransferQuicklyAndRejectMesssageAndClose(toTransfer: Amount, direction: TransferDirection) {
    tryTotransferQuicklyAndRejectMesssage(toTransfer, direction)
    let confirmModal = new ConfirmTransferModal()
    confirmModal.clickClose()
}

export function tryTotransferQuicklyAndRejectMesssageAndRetry(toTransfer: Amount, direction: TransferDirection) {
    tryTotransferQuicklyAndRejectMesssage(toTransfer, direction)
    let confirmModal = new ConfirmTransferModal()
    confirmModal.clickConfirm()
    cy.confirmMetamaskSignatureRequest()
    let trxConfirmedModal = new TrxConfirmedModal()
    trxConfirmedModal.clickOk()
}

export function transferMaxViaTopButtonAndAssertSuccess(direction: TransferDirection) {
    transferMaxByAndAssertSuccess(direction, () => { portfolioPage.clickTransfer() } )
}

export function transferMaxViaTradingBalancesAndAssertSuccess(asset: Asset, direction: TransferDirection) {
    transferMaxByAndAssertSuccess(direction, () => { tradingBalanceTab.clickTransfer(asset) } )
}

function transferMaxByAndAssertSuccess(direction: TransferDirection, transferEntryPoint: Function) {
    let fromText: string
    let toText = transferHelper.getText(direction)
    if (direction === TransferDirection.TO_TRADING_ACCOUNT) {
        fromText = transferHelper.getText(TransferDirection.TO_WALLET)
        portfolioPage.switchToWallet()
    } else {
        fromText = transferHelper.getText(TransferDirection.TO_TRADING_ACCOUNT)
        portfolioPage.switchToTradingAccount()
    }

    transferEntryPoint()
    let transferModal = new PrepareTransferModal()

    transferModal.fetchFrom()
    transferModal.fetchTo()
    cy.get('@transferFrom').then((from: unknown) => {
        cy.get('@transferTo').then((to: unknown) => {
          expect((from as string).trim(), 'Transfer direction is from wallet to trading account').to.be.equal(fromText)
          expect((to as string).trim(), 'Transfer direction is from wallet to trading account').to.be.equal(toText)
      })
    })

    //add asset selection
    transferModal.fetchAvailable()
    transferModal.clickMax()
    transferModal.fetchValue()
    cy.get('@bridgeAvailable').then((a: unknown) => {
        let available = a as Amount
        cy.get('@transferValue').then((v: unknown) => {
            let value = v as Amount
            expect(value, `Max is equal to available`).to.be.eql(available)
        })
    })

    transferModal.clickTransferNow()

    let confirmModal = new ConfirmTransferModal()
    confirmModal.fetchFrom()
    confirmModal.fetchTo()

    cy.get('@confirmFrom').then((from: unknown) => {
        cy.get('@confirmTo').then((to: unknown) => {
          expect((from as string).trim(), 'Transfer direction is from wallet to trading account').to.be.equal(fromText)
          expect((to as string).trim(), 'Transfer direction is from wallet to trading account').to.be.equal(toText)
      })
    })

    confirmModal.fetchValue()
    confirmModal.fetchUsdValue()
    cy.get('@bridgeAvailable').then((a: unknown) => {
        let available = a as Amount
        cy.get('@confirmValue').then(v => {
            let value = v as unknown as Amount
            expect(value, `Transfer amount is equal to ${available}`).to.be.eql(available)
        })
        cy.get('@confirmUsdValue').then(v => {
        let value = v as unknown as Amount
        expect(value.getValueAsNumber(), 'Transfer amount is greater than $0').to.be.greaterThan(0)
        })
    })

    confirmModal.clickConfirm()
    cy.confirmMetamaskSignatureRequest()
    let toastText: string
    if (direction === TransferDirection.TO_TRADING_ACCOUNT) {
        toastText = 'deposit to trading account successfully'
    } else {
        toastText = 'withdraw from trading account successfully'
    }
    cy.assertSuccessToastWithText(toastText)

    let trxConfirmedModal = new TrxConfirmedModal()
    trxConfirmedModal.clickOk()
}

export function assertAvailableBalanceHasChanged(asset: Asset) {
    portfolioPage.open()
    portfolioPage.switchToTradingAccount()

    cy.get('@tradingEntries').then((o: unknown) => {
        let initialEntires = o as TradingAccountBalances
        tradingBalanceTab.fetchEntries()
        console.log(`initial: ${initialEntires.getBalance(asset).available.getValueAsNumber()}`)

        cy.get('@tradingEntries').then((e: unknown) => {
            let entries = e as TradingAccountBalances

            console.log(`current: ${entries.getBalance(asset).available.getValueAsNumber()}`)
            expect(entries.getBalance(asset), `Quote asset '${asset.name}' was found in trading balances`).not.to.be.null
            expect(entries.getBalance(asset).available.getValueAsNumber().toFixed(2), `Available ${asset} has change`).not.to.be.equal(initialEntires.getBalance(asset).available.getValueAsNumber())
        })
    })
}

export function assertAvailableBalanceIncreasedAfterDeletion(asset: Asset, expectedReturnedValue: number) {
    portfolioPage.open()
    portfolioPage.switchToTradingAccount()

    cy.get('@tradingEntries').then((o: unknown) => {
        let initialEntires = o as TradingAccountBalances
        tradingBalanceTab.fetchEntries()

        cy.get('@tradingEntries').then((e: unknown) => {
            let entries = e as TradingAccountBalances

            expect(entries.getBalance(asset), `Quote asset '${asset.name}' was found in trading balances`).not.to.be.null
            let expectedAvailableBalance = initialEntires.getBalance(asset).available.getValueAsNumber() + expectedReturnedValue
            expect(entries.getBalance(asset).available.getValueAsNumber().toFixed(2), `Available ${asset} was correctly increased`).to.be.equal(expectedAvailableBalance.toFixed(2))
        })
    })
}

export function assertAvailableBalanceIsEqual(amount: Amount) {
    portfolioPage.open()
    portfolioPage.switchToTradingAccount()
    tradingBalanceTab.fetchEntries()

    cy.get('@tradingEntries').then((e: unknown) => {
        let entries = e as TradingAccountBalances

        expect(entries.getBalance(amount.asset), `Quote asset '${amount.asset.name}' was found in trading balances`).not.to.be.null
        expect(entries.getBalance(amount.asset).available.getValueAsNumber().toFixed(2), `Available ${amount.asset.name} is as expected`).to.be.equal(amount.getValueAsNumber().toFixed(2))
    })
}

export function asserMarginHoldIsEqual(amount: Amount) {
    portfolioPage.open()
    portfolioPage.switchToTradingAccount()
    tradingBalanceTab.fetchEntries()

    cy.get('@tradingEntries').then((e: unknown) => {
        let entries = e as TradingAccountBalances

        expect(entries.getBalance(amount.asset), `Quote asset '${amount.asset.name}' was found in trading balances`).not.to.be.null
        expect(entries.getBalance(amount.asset).marginHold.getValueAsNumber().toFixed(2), `Margin hold ${amount.asset.name} is as expected`).to.be.equal(amount.getValueAsNumber().toFixed(2))
    })
}

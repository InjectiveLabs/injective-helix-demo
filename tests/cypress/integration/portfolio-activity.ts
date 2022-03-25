import {
  INJ,
  LINK,
  BTC,
  USDT,
  ETH
} from "../domain/injective/assets"
import {
  DerivativeOrder,
  MarketType,
  Ticker,
  Position,
  PositionType,
  Side,
  WalletOperation,
  SpotOrder
} from "../domain/injective/trade-record"

import {
  Address,
  Network
} from "../domain/injective/blockchain"

import {
  openPortfolio,
  assertSummmaryBalanceIsAboveZero,
  assertWalletBalanceIsAtLeast,
  saveTradingAccountState,
  transferViaTopButtonAndAssertSuccess,
  transferViaTradingBalancesAndAssertSuccess,
  transferMaxViaTopButtonAndAssertSuccess,
  transferMaxViaTradingBalancesAndAssertSuccess,
  tryTotransferQuicklyAndRejectMesssageAndRetry,
  tryTotransferQuicklyAndRejectMesssageAndClose,
  assertWalletBalancesChangedBy,
  assertTradingBalancesChangedBy,
  assertAvailableBalanceIncreasedAfterDeletion,
  assertAvailableBalanceHasChanged,
  assertAvailableBalanceIsEqual,
  asserMarginHoldIsEqual
} from '../support/steps/portfolio-steps'

import {
  assertWalletHistoryHasEntries,
  openActivityTabAndAssertItHasEntries,
  assertTabHasEntries,
  cancelEntryOnPosition,
  cancelEntryWithTicker,
  cancelAllEntries,
  assertEntryCountOnTabIsEqual,
  assertThereAreNoEntriesOnTab,
  openActivityTab,
  increaseMarginBy
} from '../support/steps/activity-steps'

import {
  calculateExpectedMarginReturn,
  fetchDerivativeOrders,
  transformDerivativeOrders,
  fetchPositions,
  transformPositions,
  fetchSpotOrders,
  transformSpotOrders,
} from '../support/steps/chain-steps'

import {
  openMarketAndPlaceRestingOrder,
  openMarketAndOpenAposition
} from '../support/steps/market-steps'

import { assertWalletIsConnected } from '../support/steps/login-steps'
import Amount from "../domain/injective/amount"
import { AddressHelper } from "../support/helpers/address-helper"
import { TransferDirection } from "../domain/injective/transaction-types"
import { TradingAccountBalances } from "../domain/injective/account-balances"
import { DerivativeLimitOrder } from '@injectivelabs/exchange-api/injective_derivative_exchange_rpc_pb'
import { ActivityTabs } from './../pages/injective/exchange/activity-page'


describe('Portfolio & Activity', () => {
  beforeEach(() => {
    cy.setupMetamask('stamp depend ahead still note spring media smile hockey candy middle picture', 'kovan', 't3stP@ss')
    cy.fetchMetamaskWalletAddress().as('walletAddressRaw')
    cy.closeNotification()

    cy.visit("/")
    cy.connectWallet().then(() => {
        cy.get('@walletAddressRaw').then((m: unknown) => {
          assertWalletIsConnected(m as string)
        })
    })
  })

    it.skip('#PA1 Move some funds between accounts', () => {
    let toTransfer = new Amount(INJ, "100")

    openPortfolio()
    assertSummmaryBalanceIsAboveZero()
    assertWalletBalanceIsAtLeast(toTransfer)
    saveTradingAccountState()
    transferViaTopButtonAndAssertSuccess(toTransfer, TransferDirection.TO_TRADING_ACCOUNT)

    //todo check account summary USD value

    assertWalletBalancesChangedBy(toTransfer.invertSign())
    assertTradingBalancesChangedBy(toTransfer)
    transferViaTradingBalancesAndAssertSuccess(toTransfer, TransferDirection.TO_WALLET)

    //todo check account summary USD value

    assertWalletBalancesChangedBy(toTransfer)
    assertTradingBalancesChangedBy(toTransfer.invertSign())

    cy.get('@injAddress').then((a: unknown) => {
      let injAddress = a as Address
      cy.get('@walletAddressRaw').then((raw: unknown) => {
        let subaccountAddress = new AddressHelper().obfuscateSubaccountAddress(new Address(raw as string, Network.ETHEREUM))

        let expectedWalletEntry = new WalletOperation('--', 'Trading Account to Injective Wallet', toTransfer.asset, toTransfer, subaccountAddress, injAddress)
        let expecteTradingEntry = new WalletOperation('--', 'Injective Wallet to Trading Account', toTransfer.asset, toTransfer, injAddress, subaccountAddress)

        assertWalletHistoryHasEntries(new Array<WalletOperation>(expectedWalletEntry, expecteTradingEntry))
      })
    })
  })

    it.skip('#PA2 Transfer MAX between accounts', () => {
    openPortfolio()
    assertSummmaryBalanceIsAboveZero()
    assertWalletBalanceIsAtLeast(new Amount(INJ, "0"))
    saveTradingAccountState()
    transferMaxViaTopButtonAndAssertSuccess(TransferDirection.TO_TRADING_ACCOUNT)

    cy.get('@transferValue').then((v: unknown) => {
      let toValue = v as Amount

      assertWalletBalancesChangedBy(toValue.invertSign())
      assertTradingBalancesChangedBy(toValue)

      transferMaxViaTradingBalancesAndAssertSuccess(toValue.asset, TransferDirection.TO_WALLET)
        cy.get('@transferValue').then((v: unknown) => {

        let fromValue = v as Amount
        cy.log(`new max: ${fromValue}`)

        assertWalletBalancesChangedBy(fromValue)
        assertTradingBalancesChangedBy(fromValue.invertSign())

        //todo check account summary USD value

        cy.get('@injAddress').then((a: unknown) => {
          let injAddress = a as Address
          cy.get('@walletAddressRaw').then((raw: unknown) => {
            let subaccountAddress = new AddressHelper().obfuscateSubaccountAddress(new Address(raw as string, Network.ETHEREUM))

            let expectedWalletEntry = new WalletOperation('--', 'Trading Account to Injective Wallet', toValue.asset, toValue, subaccountAddress, injAddress)
            let expecteTradingEntry = new WalletOperation('--', 'Injective Wallet to Trading Account', fromValue.asset, fromValue, injAddress, subaccountAddress)

            assertWalletHistoryHasEntries(new Array<WalletOperation>(expectedWalletEntry, expecteTradingEntry))
          })
        })
      })
    })
  })

    it.skip('#PA3 Reject message signing when moving sign and try again', () => {
    let toTransfer = new Amount(INJ, "3")

    openPortfolio()
    assertWalletBalanceIsAtLeast(toTransfer)
    saveTradingAccountState()

    tryTotransferQuicklyAndRejectMesssageAndClose(toTransfer, TransferDirection.TO_TRADING_ACCOUNT)
    assertWalletBalancesChangedBy(new Amount(INJ, "0"))
    assertTradingBalancesChangedBy(new Amount(INJ, "0"))

    transferViaTopButtonAndAssertSuccess(toTransfer, TransferDirection.TO_TRADING_ACCOUNT)
    assertWalletBalancesChangedBy(toTransfer.invertSign())
    assertTradingBalancesChangedBy(toTransfer)

    tryTotransferQuicklyAndRejectMesssageAndRetry(toTransfer, TransferDirection.TO_WALLET)
    assertWalletBalancesChangedBy(toTransfer)
    assertTradingBalancesChangedBy(toTransfer.invertSign())
  })

  it.skip('#PA4 Filter by asset & hide small balances & summaries', () => {
    //todo add the test
  })

  it.skip('#PA5 Not enough INJ to transfer from trading to INJ wallet (only for Keplr)', () => {
    //todo add the test
  })

  it('#PA6 Open positions and cancel them', () => {
    let tab = ActivityTabs.POSITIONS
    let positionType = PositionType.POSITION

    let tickers = [new Ticker(INJ, USDT, MarketType.PERP), new Ticker(ETH, USDT, MarketType.PERP), new Ticker(BTC, USDT, MarketType.PERP)]
    for (var ticker of tickers) {
      let leverage = (Math.random() * (9.99 - 0.11) + 0.11).toFixed(2)
      let amount = (Math.random() * (0.12 - 0.01) + 0.01).toFixed(2)
     openMarketAndOpenAposition(ticker, Side.LONG, leverage, amount)
    }

    cy.wait(5000)

    //without switching to portfolio page postion fetching fails... maybe due to destroy?
    openPortfolio()
    saveTradingAccountState()
    fetchPositions()
    transformPositions()

    cy.get('@expectedPositions').then((p: any) => {
      let positions = p as Array<Position>

      expect(positions.length, `Test user has 3 positions open`).to.be.equal(3)

      openActivityTabAndAssertItHasEntries(tab, positions)

      cy.wrap(null)
      .then(() => { return positions.splice(0, 1)[0] })
      .as('positionToDelete')

      cancelEntryOnPosition(1, positionType)
      assertEntryCountOnTabIsEqual(tab, 2)

      cy.get('@positionToDelete').then((toDelete: unknown) => {
        assertTabHasEntries(tab, positions)
        //hard to say what should available be without knowing the price at which the position was closed
        assertAvailableBalanceHasChanged((toDelete as Position).entryPrice.asset)
      })
    })

    openActivityTab(tab)
    cancelAllEntries(positionType)
    assertThereAreNoEntriesOnTab(tab)

    cy.get('@positionToDelete').then((toDelete: unknown) => {
      assertAvailableBalanceHasChanged((toDelete as Position).entryPrice.asset)
    })

    fetchPositions()
    transformPositions()
    cy.get('@expectedPositions').then((p: any) => {
      expect((p as Array<Position>).length, 'Test user has no open positions').to.be.equal(0)
    })
  })

  it.skip('#PA7 Place limit orders and cancel open spot orders', () => {
    let tab = ActivityTabs.SPOT_ORDERS
    let positionType = PositionType.SPOT_ORDER

    //  let tickers = [new Ticker(INJ, USDT, MarketType.SPOT), new Ticker(ATOM, USDT, MarketType.SPOT), new Ticker(LINK, USDT, MarketType.SPOT)]
     let tickers = [new Ticker(INJ, USDT, MarketType.SPOT), new Ticker(LINK, USDT, MarketType.SPOT)]
     for (var ticker of tickers) {
      openMarketAndPlaceRestingOrder(ticker, Side.BUY, PositionType.SPOT_ORDER, (Math.floor(Math.random() * 3) + 1).toString())
     }

     cy.wait(5000)

     fetchSpotOrders()
     transformSpotOrders()

     cy.get('@expectedSpotOrders').then((o: any) => {
      let expectedOrders = o as Array<SpotOrder>
      expect(expectedOrders.length, `Test user has >= 2 orders open`).to.be.gte(2)

      openPortfolio()
      saveTradingAccountState()
      openActivityTabAndAssertItHasEntries(tab, expectedOrders)

      cy.wrap(null)
        .then(() => { return expectedOrders.splice(0, 1)[0] })
        .as('orderToDelete')

       cy.wrap(null)
       .then(() => { return expectedOrders })
       .as('expectedOrders')
    })

    fetchSpotOrders()
    cy.get('@orderToDelete').then((o: any) => {
      let order = o as SpotOrder
      cancelEntryWithTicker(order.ticker, positionType)
    })
    assertEntryCountOnTabIsEqual(tab, 1)

    cy.get('@expectedOrders').then((o: any) => {
      let expectedOrders = o as Array<SpotOrder>
      cy.get('@orderToDelete').then((order: unknown) => {
        assertTabHasEntries(tab, expectedOrders)
        cy.get('@apiSpotOrders').then((orders: any) => {
          cy.wrap(null).then(async () => {
            return (order as SpotOrder).total.getValueAsNumber()
        }).as('expectedMargin')

        cy.get('@expectedMargin').then((expected: any) => {
          assertAvailableBalanceIncreasedAfterDeletion((order as SpotOrder).ticker.quoteAsset, expected)
          })
        })
      })

      cy.wrap(null)
      .then(() => { return expectedOrders })
      .as('ordersToDelete')
    })

    openActivityTab(tab)
    cancelAllEntries(positionType)
    assertThereAreNoEntriesOnTab(tab)

    cy.get('@ordersToDelete').then((toDelete: any) => {
      // cy.get('@apiSpotOrders').then((orders: any) => {
        cy.wrap(null).then(async () => {
          let hold = 0
          for (var order of toDelete) {
            hold += (order as SpotOrder).total.getValueAsNumber()
          }
          return hold
      }).as('expectedMargin')

      cy.get('@expectedMargin').then((expected: any) => {
        assertAvailableBalanceIncreasedAfterDeletion((toDelete[0] as DerivativeOrder).ticker.quoteAsset, expected)
        })
      // })
    })

    fetchSpotOrders()
    transformSpotOrders()
    cy.get('@expectedSpotOrders').then((o: any) => {
      expect((o as Array<Position>).length, 'Test user has no open spot orders').to.be.equal(0)
    })
  })

    it.skip('#PA8 See and cancel open derviatives orders', () => {
    cy.intercept('POST', '/injective_derivative_exchange_rpc.InjectiveDerivativeExchangeRPC/StreamTrades', (req) => {
      req.destroy()
    })

    let tab = ActivityTabs.DERIVATIVE_ORDERS
    let positionType = PositionType.DERIVATIVE_ORDER

    let tickers = [new Ticker(INJ, USDT, MarketType.PERP), new Ticker(ETH, USDT, MarketType.PERP), new Ticker(BTC, USDT, MarketType.PERP)]
    for (var ticker of tickers) {
      let leverage = (Math.random() * (9.99 - 0.11) + 0.11).toFixed(1)
      let amount = (Math.random() * (0.12 - 0.001) + 0.001).toFixed(3)
      openMarketAndPlaceRestingOrder(ticker, Side.LONG, PositionType.DERIVATIVE_ORDER, amount, leverage)
    }

    cy.intercept('POST', '/injective_derivative_exchange_rpc.InjectiveDerivativeExchangeRPC/StreamTrades', (req) => {
      req.continue()
    })

    openPortfolio()
    saveTradingAccountState()
    fetchDerivativeOrders()
    transformDerivativeOrders()

    cy.get('@expectedDerivativeOrders').then((o: any) => {
      let expectedOrders = o as Array<DerivativeOrder>
      expect(expectedOrders.length, `Test user has >= 3 derivatives orders open`).to.be.gte(3)

      openActivityTabAndAssertItHasEntries(tab, expectedOrders)

      cy.wrap(null)
        .then(() => { return expectedOrders.splice(0, 1)[0] })
        .as('orderToDelete')

       cy.wrap(null)
       .then(() => { return expectedOrders })
       .as('expectedOrders')
    })

    cy.get('@orderToDelete').then((o: any) => {
      let order = o as DerivativeOrder
      cancelEntryWithTicker(order.ticker, positionType)
    })

    cy.get('@expectedOrders').then((o: any) => {
      let expectedOrders = o as Array<DerivativeOrder>
      assertEntryCountOnTabIsEqual(tab, expectedOrders.length)
      cy.get('@orderToDelete').then((order: unknown) => {
        assertTabHasEntries(tab, expectedOrders)
        cy.get('@apiDerivativeOrders').then((o: any) => {
          let originalApiOrders = o as Array<DerivativeLimitOrder>
          cy.wrap(null).then(async () => {
            return await calculateExpectedMarginReturn(originalApiOrders[0])
          }).as('expectedMargin')
        })

        cy.get('@expectedMargin').then((expected: any) => {
          assertAvailableBalanceIncreasedAfterDeletion((order as DerivativeOrder).ticker.quoteAsset, expected)
          })
        })
    })

    fetchDerivativeOrders()
    openActivityTab(tab)
    cancelAllEntries(positionType)
    assertThereAreNoEntriesOnTab(tab)

    cy.get('@expectedOrders').then((toDelete: any) => {
      cy.get('@apiDerivativeOrders').then((orders: any) => {
        cy.wrap(null).then(async () => {
          let hold = 0
          for (var order of orders) {
            console.log(typeof toDelete)
            console.log(toDelete)
            hold += await calculateExpectedMarginReturn(order)
          }
          return hold
      }).as('expectedMargin')

      cy.get('@expectedMargin').then((expected: any) => {
        assertAvailableBalanceIncreasedAfterDeletion((toDelete[0] as DerivativeOrder).ticker.quoteAsset, expected)
        })
      })
    })

    fetchDerivativeOrders()
    transformDerivativeOrders()
    cy.get('@expectedDerivativeOrders').then((o: any) => {
      expect((o as Array<Position>).length, 'Test user has no open derivative orders').to.be.equal(0)
    })
  })

    it.skip('#PA9 User can increase margin from activity page', () => {
    cy.intercept('POST', '/injective_derivative_exchange_rpc.InjectiveDerivativeExchangeRPC/StreamTrades', (req) => {
      req.destroy()
    })

    let tab = ActivityTabs.POSITIONS

    let ticker = new Ticker(INJ, USDT, MarketType.PERP)
    let leverage = (Math.random() * (9.99 - 0.11) + 0.11).toFixed(2)
    let amount = (Math.random() * (12.12 - 3.17) + 6.17).toFixed(3)
    openMarketAndOpenAposition(ticker, Side.LONG, leverage, amount)


    cy.wait(5000)
    let marginIncrease = Number(Math.floor(Math.random() * (4 - 1) + 1).toFixed(3))

    fetchPositions()
    transformPositions()

    cy.get('@expectedPositions').then((p: any) => {
      let positions = p as Array<Position>
      expect(positions.length, `Test user has >= 1 positions open`).to.be.gte(1)

      openPortfolio()
      saveTradingAccountState()
      openActivityTabAndAssertItHasEntries(tab, positions)
      increaseMarginBy(ticker, marginIncrease)
      cy.wait(5000) //so that liquidation price on chain has changed
    })

    fetchPositions()
    transformPositions()

    cy.get('@expectedPositions').then((p: any) => {
      let positions = p as Array<Position>
      openActivityTab(ActivityTabs.DERIVATIVE_ORDERS)
      openActivityTab(ActivityTabs.POSITIONS)

      assertTabHasEntries(tab, positions)

      cy.get('@tradingEntries').then((e: unknown) => {
        let entries = e as TradingAccountBalances

        let expectedAvailable = entries.getBalance(ticker.quoteAsset).available.getValueAsNumber() - marginIncrease
        assertAvailableBalanceIsEqual(new Amount(ticker.quoteAsset, expectedAvailable.toFixed(3)))

        let expectedTotal = entries.getBalance(ticker.quoteAsset).marginHold.getValueAsNumber() + marginIncrease
        asserMarginHoldIsEqual(new Amount(ticker.quoteAsset, expectedTotal.toFixed(3)))
      })
    })
  })
})

import { Address, Network } from "../../../domain/injective/blockchain"
import { AddressHelper } from "../../../support/helpers/address-helper"
import { Ticker } from '../../../domain/injective/trade-record'

export default class HeaderPart {
  readonly connectButtonCy = 'wallet-connect-button'
    readonly portfolioLinkCy = 'header-portfolio-link'
    readonly activityLinkCy = 'header-activity-link'
    readonly marketLinkCy = 'header-markets-link'
    readonly walletAddressCy = 'wallet-connected'
    readonly addressesPopupCy = 'wallet-connected-popper-wallet-address'

    connectWallet(wallet: string = 'Metamask') {
        cy.getByDataCy(this.connectButtonCy).click()
        cy.getByDataCy(`wallet-connect-${wallet.toLowerCase()}`).click()

        cy.acceptMetamaskAccessSafely()
        cy.assertSuccessToastWithText('successfully connected')
    }

    fetchConnectedWalletAddress() {
        cy.getByDataCy(this.walletAddressCy).realHover().then(() => {
          cy.getByDataCy(this.addressesPopupCy).invoke('text').then(t => {
            return new Address(t.trim(), Network.ETHEREUM)
          }).as('connectedWalletAddress').then(() => {
            cy.getByDataCy(this.portfolioLinkCy).realHover()
        })
      })
    }

    fetchInjAddress() {
      cy.getByDataCy(this.walletAddressCy).invoke('text').then(t => {
        return new Address(t.trim(), Network.INJECTIVE_CHAIN)
      }).as('injAddress')
    }

    clickOnPortfolio() {
      cy.getByDataCy(this.portfolioLinkCy).click({force: true})
    }

    clickOnActivity() {
      cy.getByDataCy(this.activityLinkCy).click({force: true})
    }

    navigateToMarket(ticker: Ticker) {
      cy.intercept('GET', '*market_summary*').as('marketSummary')
      cy.intercept('POST', '/injective.exchange.v1beta1.Query/FeeDiscountAccountInfo').as('FeeDiscountAccountInfo') //x2

      cy.getByDataCy(this.marketLinkCy).click({force: true})
      cy.getByDataCy(`'slideout-ticker-${ticker.toString()}'`).click({force: true})
      let toAwait = ['@marketSummary', '@FeeDiscountAccountInfo']
      // if (ticker.marketType === MarketType.PERP) {
      //   toAwait.push('@DerivativeTrades')
      //   toAwait.push('@DerivativeOrderbook')
      // } else {
      //   toAwait.push('@SpotTrades')
      //   toAwait.push('@SpotOrderbook')
      // }
      cy.wait(toAwait)
      cy.wait(3000) //my god no!!!
    }

    assertWalletIsConnected(expectedWalletAddress: string) {
      this.fetchConnectedWalletAddress()
      this.fetchInjAddress()
      cy.get('@connectedWalletAddress').then((c: unknown) => {
        let connectedWalletAddress = c as Address
        expect(connectedWalletAddress.value).to.contain(new AddressHelper().obfuscateAddress(new Address(expectedWalletAddress, Network.ETHEREUM)).value.toLowerCase())
      })
    }
}
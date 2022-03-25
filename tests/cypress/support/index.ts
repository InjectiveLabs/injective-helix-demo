// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import './etherscan'
import 'cypress-xpath'
import 'cypress-real-events/support'
import './utils'
import './helpers/address-helper'

/// <reference types="cypress" />
declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.getByDataCy('greeting')
       */
      getByDataCy<E extends Node = HTMLElement>(value: string): Chainable<JQuery<E>>
      /**
       * Custom command to select DOM element by partial data-cy attribute.
       * @example cy.getByContainingDataCy('greeting')
       */
      getByContainingDataCy<E extends Node = HTMLElement>(value: string): Chainable<JQuery<E>>
      /**
       * Custom command to select DOM element by data-cy-hash attribute.
       * @example cy.getByDataCyHash('0xb2891b1c282365ee29ab9acbb939f2c85d9c543c318c6cabee092774b86f731f')
       */
       getByDataCyHash<E extends Node = HTMLElement>(value: string): Chainable<JQuery<E>>
      /**
       * Custom command to find chilren DOM elements by data-cy attribute.
       * @example cy.get('#first).findByDataCy('greeting')
       */
      findByDataCy<E extends Node = HTMLElement>(value: string): Chainable<JQuery<E>>
      /**
       * Connect puppeteer with Cypress instance
       * @example
       * cy.initPuppeteer()
       */
      initPuppeteer(): Chainable<Subject>
      /**
       * Assign currently open tabs with puppeteer
       * @example
       * cy.assignWindows()
       */
      assignWindows(): Chainable<Subject>
      /**
       * Sets up Metamask using provided data
       * @example
       * cy.setupMetamask('secret words', 'kovan', '123456')
       */
      setupMetamask(secret: string, network: string, password: string): Chainable<Subject>
      /**
       * Checks if current active tab is metamask
       * @example
       * cy.isMetamaskWindowActive()
       */
      isMetamaskWindowActive(): Chainable<Subject>
      /**
       * Checks if current active tab is cypress
       * @example
       * cy.isCypressWindowActive()
       */
      isCypressWindowActive(): Chainable<Subject>
      /**
       * Switch to Cypress window
       * @example
       * cy.switchToCypressWindow()
       */
      switchToCypressWindow(): Chainable<Subject>
      /**
       * Switch to metamask window
       * @example
       * cy.switchToMetamaskWindow()
       */
      switchToMetamaskWindow(): Chainable<Subject>
      /**
       * Switch to metamask notification window
       * @example
       * cy.switchToMetamaskNotification()
       */
      switchToMetamaskNotification(): Chainable<Subject>
      /**
       * Get current network
       * @example
       * cy.getNetwork()
       */
      getNetwork(): Chainable<Subject>
      /**
       * Add network in metamask
       * @example
       * cy.addMetamaskNetwork({networkName: 'name', rpcUrl: 'https://url', chainId: '1', symbol: 'ETH', blockExplorer: 'https://url', isTestnet: true})
       */
      addMetamaskNetwork(network: object): Chainable<Subject>
      /**
       * Change network in metamask
       * @example
       * cy.changeMetamaskNetwork('kovan')
       * cy.changeMetamaskNetwork('custom network')
       * cy.changeMetamaskNetwork({networkName: 'name'})
       */
      changeMetamaskNetwork(network: string): Chainable<Subject>
      /**
       * Import new account in metamask using secret words and set a new password
       * @example
       * cy.importMetamaskWallet('my words go here', 'new password')
       */
      importMetamaskWallet(secret: string, password: string): Chainable<Subject>
      /**
       * Import new account in metamask using private key
       * @example
       * cy.importMetaMaskWalletUsingPrivateKey('private_key')
       */
       importMetaMaskWalletUsingPrivateKey(privateKey: string): Chainable<Subject>
      /**
       * Create new account in metamask
       * @example
       * cy.createMetamaskAccount()
       * cy.createMetamaskAccount('accountName')
       */
      createMetamaskAccount(accountName: string | undefined): Chainable<Subject>
      /**
       * Switch metamask account
       * @example
       * cy.switchMetamaskAccount(2)
       * cy.switchMetamaskAccount('Account 2')
       */
      switchMetamaskAccount(
        accountNameOrAccountNumber: string | number,
      ): Chainable<Subject>
      /**
       * Get initial wallet address of metamask wallet (set at initialisation)
       * @example
       * cy.getMetamaskWalletAddress().then(address => cy.log(address))
       */
      getMetamaskWalletAddress(): Chainable<Subject>
      /**
      * Activate ability (in metamask settings) to specify custom nonce while doing transactions in metamask
      * @example
      * cy.activateCustomNonceInMetamask()
      */
      activateCustomNonceInMetamask(): Chainable<Subject>
      /**
       * Reset metamask account state in settings
       * @example
       * cy.resetMetamaskAccount()
       */
      resetMetamaskAccount(): Chainable<Subject>
      /**
       * Disconnects metamask wallet from last connected dapp
       * @example
       * cy.disconnectMetamaskWalletFromDapp()
       */
      disconnectMetamaskWalletFromDapp(): Chainable<Subject>
      /**
       * Disconnects metamask wallet from all connected dapps
       * @example
       * cy.disconnectMetamaskWalletFromAllDapps()
       */
      disconnectMetamaskWalletFromAllDapps(): Chainable<Subject>
      /**
       * Confirm metamask permission to sign message
       * @example
       * cy.confirmMetamaskSignatureRequest()
       */
      confirmMetamaskSignatureRequest(): Chainable<Subject>
      /**
       * Reject metamask permission to sign message
       * @example
       * cy.rejectMetamaskSignatureRequest()
       */
      rejectMetamaskSignatureRequest(): Chainable<Subject>
      /**
       * Is metamask notification displayed?
       * @example
       * cy.isMetamaskNotificationDisplayed()
       */
      isMetamaskNotificationDisplayed(): Chainable<Subject>
      /**
       * Confirm metamask transaction
       * @example
       * cy.confirmMetamaskTransaction()
       */
       confirmMetamaskTransaction(): Chainable<Subject>
      /**
       * Reject metamask transaction
       * @example
       * cy.rejectMetamaskTransaction()
       */
       rejectMetamaskTransaction(): Chainable<Subject>
      /**
       * Accept metamask access request
       * @example
       * cy.acceptMetamaskAccess()
       */
      acceptMetamaskAccess(): Chainable<Subject>
      /**
       * Close metamask notification if it's open
       * @example
       * cy.closeNotification()
       */
      closeNotification(): Chainable<Subject>
      /**
       * Accept metamask access request (if it is displayed)
       * @example
       * cy.acceptMetamaskAccessSafely()
       */
       acceptMetamaskAccessSafely(): Chainable<Subject>
      /**
       * Confirm metamask atransaction
       * @example
       * cy.confirmMetamaskTransaction()
       * cy.confirmMetamaskTransaction({gasFee: 10, gasLimit: 1000000})
       */
      confirmMetamaskTransaction(gasConfig : object | undefined): Chainable<Subject>
      /**
       * Reject metamask transaction
       * @example
       * cy.rejectMetamaskTransaction()
       */
      rejectMetamaskTransaction(): Chainable<Subject>
      /**
       * Allow site to add new network in metamask
       * @example
       * cy.allowMetamaskToAddNetwork()
       */
      allowMetamaskToAddNetwork(): Chainable<Subject>
      /**
       * Reject site to add new network in metamask
       * @example
       * cy.rejectMetamaskToAddNetwork()
       */
      rejectMetamaskToAddNetwork(): Chainable<Subject>
      /**
       * Allow site to switch network in metamask
       * @example
       * cy.allowMetamaskToSwitchNetwork()
       */
      allowMetamaskToSwitchNetwork(): Chainable<Subject>
      /**
       * Reject site to switch network in metamask
       * @example
       * cy.rejectMetamaskToSwitchNetwork()
       */
      rejectMetamaskToSwitchNetwork(): Chainable<Subject>
      /**
       * Allow site to add new network in metamask and switch to it
       * @example
       * cy.allowMetamaskToAddAndSwitchNetwork()
       */
      allowMetamaskToAddAndSwitchNetwork(): Chainable<Subject>
      /**
       * Unlock metamask
       * @example
       * cy.unlockMetamask('password')
       */
      unlockMetamask(password: string): Chainable<Subject>
      /**
       * Fetches previous metamask wallet address
       * @example
       * cy.fetchMetamaskWalletAddress().then(address => cy.log(address))
       */
      fetchMetamaskWalletAddress(): Chainable<Subject>
      /**
       * Get transaction status from Etherscan API
       * @example
       * cy.etherscanGetTransactionStatus('0xf..')
       */
      etherscanGetTransactionStatus(txid: string): Chainable<Subject>;
      /**
       * Wait until transaction is success using Etherscan API
       * @example
       * cy.etherscanWaitForTxSuccess('0xf..')
       */
      etherscanWaitForTxSuccess(txid: string): Chainable<Subject>;
      /**
       * Wait until all XHR requests are finished (networkidle0)
       * @example
       * cy.waitForResources()
       * cy.waitForResources([{name:"fa-solid-900.woff2"}])
       * cy.waitForResources([{name:"fonts.gstatic.com/s/worksans",number:2}])
       */
      waitForResources(
        resources: Array<{ name: string; number?: number }> | undefined,
      ): Chainable<Subject>
      /**
       * Connects wallet to Injective Pro
       * @example
       * cy.connectWallet()
       */
      connectWallet(): Chainable<Subject>
      /**
       * Asserts that among all success toasts that are displayed one has given text
       * @example
       * cy.assertSuccessToastWithText('Succcessfully connected')
       */
      assertSuccessToastWithText(text: string): Chainable<Subject>
      /**
       * Asserts that among all failure toasts that are displayed one has given text
       * @example
       * cy.assertFailureToastWithText('User rejected signing')
       */
      assertFailureToastWithText(text: string): Chainable<Subject>
      /**
       * Asserts that no failure toast is displayed
       * @example
       * cy.assertNoFailureToast()
       */
      assertNoFailureToast(): Chainable<Subject>
      /**
       * Asserts that there's at least one success toast displayed
       * @example
       * cy.assertAnySuccessToast()
       */
        assertAnySuccessToast(): Chainable<Subject>
    }
  }
}

// Cypress.on('window:before:load', (win) => {
//   cy.stub(win.console, 'error').callsFake(message => {
//     cy.now('task', 'error', message)
//   })

//   cy.stub(win.console, 'warn').callsFake(message => {
//     cy.now('task', 'warn', message)
//   })
// })
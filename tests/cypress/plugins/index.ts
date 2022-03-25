import Helpers from '../support/helpers'
import Puppeteer from '../support/puppeteer'
import Metamask from '../support/metamask'
import Etherscan from '../support/etherscan'
import { setDebuggerPort } from './../support/global-context'

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {

  let helpers = new Helpers()
  let puppeteer = new Puppeteer()
  let metamask = new Metamask(puppeteer)
  let etherscan = new Etherscan()

  on('before:browser:launch', async (browser: Cypress.Browser, arguments_) => {
    console.log('Loading MetaMask Extension')
    if (browser.name === 'chrome' && browser.isHeadless) {
      console.log('TRUE') // required by cypress ¯\_(ツ)_/¯
      arguments_.args.push('--window-size=1920,1080')
      return arguments_
    }

    if (browser.name === 'electron') {
      return arguments_
    }

    let options = arguments_.args as Array<any>
    for (var option of options) {
      if (option.indexOf('--remote-debugging-port=') !== -1) {
        let port = option.replace('--remote-debugging-port=', '')
        console.log('Found CDP port: ' + port)
        setDebuggerPort(port)
      }
    }

    // metamask welcome screen blocks cypress from loading
    if (browser.name === 'chrome') {
      arguments_.args.push(
        // '--auto-open-devtools-for-tabs',
        '--disable-gpu',
        '--use-gl=desktop/swiftshader',
        // '--remote-debugging-port=9222',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
      )
    }

    // NOTE: extensions cannot be loaded in headless Chrome
    const metamaskPath = await helpers.prepareMetamask(
      process.env.METAMASK_VERSION || '9.7.1', //latest has slightly different locators (and is slower)
    )
    arguments_.extensions.push(metamaskPath)
    return arguments_
  })


  on('task', {
    error(message: string) {
      console.error('\u001B[31m', 'ERROR:', message, '\u001B[0m')
      return true
    },
    warn(message: string) {
      console.warn('\u001B[33m', 'WARNING:', message, '\u001B[0m')
      return true
    },
    async initPuppeteer() {
      const connected = await puppeteer.init()
      return connected
    },
    async assignWindows() {
      const assigned = await puppeteer.assignWindows()
      return assigned
    },
    async switchToCypressWindow() {
      const switched = await puppeteer.switchToCypressWindow()
      return switched
    },
    async switchToMetamaskWindow() {
      const switched = await puppeteer.switchToMetamaskWindow()
      return switched
    },
    async switchToMetamaskNotification() {
      const notificationPage = await puppeteer.switchToMetamaskNotification()
      return notificationPage
    },
    async confirmMetamaskWelcomePage() {
      const confirmed = await metamask.confirmWelcomePage()
      return confirmed
    },
    async unlockMetamask(password) {
      if (process.env.PASSWORD) {
        password = process.env.PASSWORD
      }
      const unlocked = await metamask.unlock(password)
      return unlocked
    },
    async importMetamaskWallet({ secretWords, password }) {
      if (process.env.SECRET_WORDS) {
        secretWords = process.env.SECRET_WORDS
      }
      if (process.env.PASSWORD) {
        password = process.env.PASSWORD
      }
      const imported = await metamask.importWallet(secretWords, password)
      return imported
    },
    async importMetaMaskWalletUsingPrivateKey({ key }) {
      await puppeteer.switchToMetamaskWindow()
      const imported = await metamask.importMetaMaskWalletUsingPrivateKey(key)
      await puppeteer.switchToMetamaskWindow()
      return imported
    },
    async addMetamaskNetwork(network) {
      const networkAdded = await metamask.addNetwork(network)
      return networkAdded
    },
    async changeMetamaskNetwork(network) {
      if (process.env.NETWORK_NAME) {
        network = process.env.NETWORK_NAME
      } else {
        network = 'kovan'
      }
      const networkChanged = await metamask.changeNetwork(network)
      return networkChanged
    },
    async closeNotification() {
      const result = await puppeteer.closePageNamed('notification')
      return result
    },
    async acceptMetamaskAccess() {
      const accepted = await metamask.acceptAccess()
      return accepted
    },
    async acceptMetamaskAccessSafely() {
      const accepted = await metamask.acceptAccessSafely()
      return accepted
    },
    async confirmMetamaskTransaction() {
      const confirmed = await metamask.confirmTransaction()
      return confirmed
    },
    async rejectMetamaskTransaction() {
      const rejected = await metamask.rejectTransaction()
      return rejected
    },
    async confirmSignatureRequest() {
      const confirmed = await metamask.confirmSignatureRequest()
      return confirmed
    },
    async rejectSignatureRequest() {
      const rejected = await metamask.rejectSignatureRequest()
      return rejected
    },
    async getMetamaskWalletAddress() {
      const walletAddress = await metamask.readWalletAddress()
      return walletAddress
    },
    async fetchMetamaskWalletAddress() {
      return metamask.getWalletAddress()
    },
    async isMetamaskNotificationDisplayed() {
      return puppeteer.isMetamaskNotificationDisplayed()
    },
    async setupMetamask({ secretWordsOrPrivateKey, network, password }) {
      if (puppeteer.getMetamaskWindow()) {
        await puppeteer.switchToCypressWindow()
        return true
      } else {
        if (process.env.NETWORK_NAME) {
          network = process.env.NETWORK_NAME
        }
        if (process.env.SECRET_WORDS) {
          secretWordsOrPrivateKey = process.env.SECRET_WORDS
        }
        if (process.env.PASSWORD) {
          password = process.env.PASSWORD
        }
        await metamask.initialSetup({ secretWordsOrPrivateKey, network, password })
        return true
      }
    },

    async changeAccount(number: number) {
      await puppeteer.switchToMetamaskWindow()
      await metamask.changeAccount(number)
      await puppeteer.switchToCypressWindow()

      return null
    },

    getNetwork() {
      const network = helpers.getNetwork()
      return network
    },

    async addNetwork(net: any) {
      const network = metamask.addNetwork(net)
      return network
    },

    async etherscanGetTransactionStatus(txId: string) {
      return await etherscan.getTransactionStatus(txId)
    },

    async etherscanWaitForTxSuccess(txId: string) {
      return await etherscan.waitForTxSuccess(txId)
    },
  })

  return config
}
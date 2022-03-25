import Helpers from './helpers'
import Puppeteer from './puppeteer'

import NotificationPage from '../pages/metamask/notification-page'
import FirstTimeFlowPage from '../pages/metamask/first-time-flow-page'
import { MainPage, AccountMenu, OptionsPage, NetworkSwitcherPart, AccountModal, Popup } from '../pages/metamask/main-page'
import UnlockPage from '../pages/metamask/unlock-page'
import WhatsNewPopup from '../pages/metamask/whats-new-popup'

export default class Metamask {

  puppeteer: Puppeteer

  constructor(puppeteer: Puppeteer) {
    this.puppeteer = puppeteer
  }

    private walletAddress: string
    private helpers: Helpers = new Helpers()
    private notificationPO: NotificationPage = new NotificationPage()
    private firstTimePO: FirstTimeFlowPage = new FirstTimeFlowPage()
    private mainPO: MainPage = new MainPage()
    private accountMenuPO: AccountMenu = new AccountMenu()
    private unlockPO: UnlockPage = new UnlockPage()
    private networkSwitcherPO: NetworkSwitcherPart = new NetworkSwitcherPart()
    private optionsPO: OptionsPage = new OptionsPage()
    private accountModalPO: AccountModal = new AccountModal()
    private popupPO: Popup = new Popup()
    private whatsNewPopupPO: WhatsNewPopup = new WhatsNewPopup()

  // workaround for metamask random blank page on first run
  async fixBlankPage() {
    // await this.puppeteer.getMetamaskWindow().waitForTimeout(1000)
    for (let times = 0; times < 5; times++) {
      // if (
      //   (await this.puppeteer.getMetamaskWindow().$(this.firstTimePO.app)) === null
      // ) {
        if(!(await this.puppeteer.isDisplayed(this.firstTimePO.app)) ){
        await this.puppeteer.getMetamaskWindow().reload()
        await this.puppeteer.getMetamaskWindow().waitForTimeout(1000)
      } else {
        break
      }
    }
  }

  async changeAccount(number: number) {
    await this.puppeteer.waitAndClick(this.accountMenuPO.button)
    await this.puppeteer.changeAccount(number)
  }

  async importMetaMaskWalletUsingPrivateKey(privateKey: string): Promise<boolean> {
    await this.puppeteer.waitAndClick(this.accountMenuPO.button)
    await this.puppeteer.waitAndClickByText(this.accountMenuPO.importAccount, 'Import Account')
    await this.puppeteer.waitAndType(this.accountMenuPO.privateKeyBox, privateKey)
    await this.puppeteer.getMetamaskWindow().waitForTimeout(500)
    await this.puppeteer.waitAndClickByText(this.accountMenuPO.importButton, 'Import')
    await this.puppeteer.getMetamaskWindow().waitForTimeout(2000)

    return true
}

  async confirmWelcomePage(): Promise<boolean> {
    await this.fixBlankPage()
    await this.puppeteer.waitAndClick(this.firstTimePO.confirmButton)

    return true
  }

  async unlock(password: string): Promise<boolean> {
    await this.fixBlankPage()
    await this.puppeteer.waitAndType(this.unlockPO.passwordInput, password)
    await this.puppeteer.waitAndClick(this.unlockPO.unlockButton)

    return true
  }

  async importWallet(secretWords: string, password: string): Promise<boolean> {
    await this.puppeteer.waitAndClick(this.firstTimePO.importWalletButton)
    await this.puppeteer.waitAndClick(this.firstTimePO.optOutAnalyticsButton)
    await this.puppeteer.waitAndType(
      this.firstTimePO.secretWordsInput,
      secretWords,
    )
    await this.puppeteer.waitAndType(
      this.firstTimePO.passwordInput,
      password,
    )
    await this.puppeteer.waitAndType(
      this.firstTimePO.confirmPasswordInput,
      password,
    )
    await this.puppeteer.waitAndClick(this.firstTimePO.termsCheckbox)
    await this.puppeteer.waitAndClick(this.firstTimePO.importButton)

    await this.puppeteer.waitFor(this.mainPO.loadingSpinner)
    await this.puppeteer.waitAndClick(this.firstTimePO.allDoneButton)
    await this.puppeteer.waitFor(this.mainPO.walletOverview)

    // close popup if present
    // if ((await this.puppeteer.getMetamaskWindow().$(this.popupPO.container)) !== null) {
    if ((await this.puppeteer.isDisplayed(this.popupPO.container, 2000))) {
      await this.puppeteer.waitAndClick(this.popupPO.closeButton)
    }

    return true
  }


  async changeNetwork(network: any): Promise<boolean> {
    this.helpers.setNetworkConfiguration(network)
    await this.puppeteer.waitAndClick(this.networkSwitcherPO.button)
    if (network === 'main' || network === 'mainnet') {
      await this.puppeteer.waitAndClick(
        this.networkSwitcherPO.networkButton(0),
      )
    } else if (network === 'ropsten') {
      await this.puppeteer.waitAndClick(
        this.networkSwitcherPO.networkButton(1),
      )
    } else if (network === 'kovan') {
      await this.puppeteer.waitAndClick(
        this.networkSwitcherPO.networkButton(2),
      )
    } else if (network === 'rinkeby') {
      await this.puppeteer.waitAndClick(
        this.networkSwitcherPO.networkButton(3),
      )
    } else if (network === 'goerli') {
      await this.puppeteer.waitAndClick(
        this.networkSwitcherPO.networkButton(4),
      )
    } else if (network === 'localhost') {
      await this.puppeteer.waitAndClick(
        this.networkSwitcherPO.networkButton(5),
      )
    }
    else if (typeof network === 'object') {
      await this.puppeteer.waitAndClickByText(
        this.networkSwitcherPO.dropdownMenuItem,
        network.networkName,
      )
    } else {
      await this.puppeteer.waitAndClickByText(
        this.networkSwitcherPO.dropdownMenuItem,
        network,
      )
    }

    if (typeof network === 'object') {
      await this.puppeteer.waitForText(
        this.networkSwitcherPO.networkName,
        network.networkName,
      )
    } else {
      await this.puppeteer.waitForText(
        this.networkSwitcherPO.networkName,
        network,
      )
    }

    return true
  }

  async addNetwork(network: object): Promise<boolean> {
    throw new Error('not implemented')
    // if (
    //   process.env.NETWORK_NAME &&
    //   process.env.RPC_URL &&
    //   process.env.CHAIN_ID
    // ) {
    //   network = {
    //     networkName: process.env.NETWORK_NAME,
    //     rpcUrl: process.env.RPC_URL,
    //     chainId: process.env.CHAIN_ID,
    //     symbol: process.env.SYMBOL,
    //     blockExplorer: process.env.BLOCK_EXPLORER,
    //     isTestnet: process.env.IS_TESTNET,
    //   }
    // }
    // await this.puppeteer.waitAndClick(mainPageElements.accountMenu.button)
    // await this.puppeteer.waitAndClick(mainPageElements.accountMenu.settingsButton)
    // await this.puppeteer.waitAndClick(mainPageElements.settingsPage.networksButton)
    // await this.puppeteer.waitAndClick(
    //   mainPageElements.networksPage.addNetworkButton,
    // )
    // await this.puppeteer.waitAndType(
    //   mainPageElements.addNetworkPage.networkNameInput,
    //   network.networkName,
    // )
    // await this.puppeteer.waitAndType(
    //   mainPageElements.addNetworkPage.rpcUrlInput,
    //   network.rpcUrl,
    // )
    // await this.puppeteer.waitAndType(
    //   mainPageElements.addNetworkPage.chainIdInput,
    //   network.chainId,
    // )

    // if (network.symbol) {
    //   await this.puppeteer.waitAndType(
    //     mainPageElements.addNetworkPage.symbolInput,
    //     network.symbol,
    //   )
    // }

    // if (network.blockExplorer) {
    //   await this.puppeteer.waitAndType(
    //     mainPageElements.addNetworkPage.blockExplorerInput,
    //     network.blockExplorer,
    //   )
    // }
    // await this.puppeteer.waitAndClick(mainPageElements.addNetworkPage.saveButton)
    // await this.puppeteer.waitAndClick(mainPageElements.networksPage.closeButton)
    // await this.puppeteer.waitForText(
    //   mainPageElements.networkSwitcher.networkName,
    //   network.networkName,
    // )
    // return true
  }

  async acceptAccessSafely(): Promise<boolean> {
    if ((await this.puppeteer.isMetamaskNotificationDisplayed())) {
      await this.acceptAccess()
    }

    return true
  }

  async acceptAccess(): Promise<boolean> {
    // await this.puppeteer.getMetamaskWindow().waitForTimeout(3000)
    const notificationPage = await this.puppeteer.switchToMetamaskNotification()
    await this.puppeteer.waitAndClick(
      this.notificationPO.nextButton,
      notificationPage,
    )
    await this.puppeteer.waitAndClick(
      this.notificationPO.connectButton,
      notificationPage,
    )
    // await this.puppeteer.getMetamaskWindow().waitForTimeout(3000)

    return true
  }

  async confirmTransaction(): Promise<boolean> {
    await this.puppeteer.getMetamaskWindow().waitForTimeout(3000)
    const notificationPage = await this.puppeteer.switchToMetamaskNotification()
    // const currentGasFee = await this.puppeteer.waitAndGetValue(
    //   this.notificationPO.gasFeeInput,
    //   notificationPage,
    // )

    // const newGasFee = isKovanTestnet
    //   ? '1'
    //   : (Number(currentGasFee) + 10).toString()
    // await this.puppeteer.waitAndSetValue(
    //   newGasFee,
    //   this.notificationPO.gasFeeInput,
    //   notificationPage,
    // )
    // metamask reloads popup after changing a fee, you have to wait for this event otherwise transaction will fail
    await this.puppeteer.getMetamaskWindow().waitForTimeout(3000)
    await this.puppeteer.waitAndClick(
      this.notificationPO.confirmButton,
      notificationPage,
    )
    await this.puppeteer.getMetamaskWindow().waitForTimeout(3000)

    return true
  }

  async rejectTransaction(): Promise<boolean> {
    await this.puppeteer.getMetamaskWindow().waitForTimeout(3000)
    const notificationPage = await this.puppeteer.switchToMetamaskNotification()
    await this.puppeteer.waitAndClick(
      this.notificationPO.rejectButton,
      notificationPage,
    )
    await this.puppeteer.getMetamaskWindow().waitForTimeout(3000)

    return true
  }

  async confirmSignatureRequest(): Promise<boolean> {
    await this.waitForNotification()
    const notificationPage = await this.puppeteer.switchToMetamaskNotification()
    await this.puppeteer.waitAndClick(
      this.notificationPO.confirmSignatureRequestButton,
      notificationPage,
    );
    await this.puppeteer.getMetamaskWindow().waitForTimeout(3000);
    return true;
  }

  async rejectSignatureRequest(): Promise<boolean> {
    await this.waitForNotification()
    const notificationPage = await this.puppeteer.switchToMetamaskNotification()
    await this.puppeteer.waitAndClick(
      this.notificationPO.rejectSignatureRequestButton,
      notificationPage,
    );
    await this.puppeteer.getMetamaskWindow().waitForTimeout(3000);
    return true;
  }

  async waitForNotification() {
    await this.puppeteer.waitForTabNamed('notification', 5000, true)
  }

  async getMessageContent(): Promise<any> {
    await this.puppeteer.getMetamaskWindow().waitForTimeout(3000)
    const notificationPage = await this.puppeteer.switchToMetamaskNotification()
    const content = await this.puppeteer.waitAndGetValue(this.notificationPO.messageContent)

    return JSON.parse(content)
  }

  async readWalletAddress(): Promise<string> {
    await this.puppeteer.waitAndClick(this.optionsPO.button)
    await this.puppeteer.waitAndClick(this.optionsPO.accountDetailsButton)
    this.walletAddress = await this.puppeteer.waitAndGetValue(
      this.accountModalPO.walletAddressInput,
    )
    await this.puppeteer.waitAndClick(this.accountModalPO.closeButton)

    return this.walletAddress
  }

  async initialSetup({ secretWordsOrPrivateKey, network, password }): Promise<boolean> {
    const isCustomNetwork =
      process.env.NETWORK_NAME && process.env.RPC_URL && process.env.CHAIN_ID

    await this.puppeteer.init()
    await this.puppeteer.assignWindows()
    // await this.puppeteer.getMetamaskWindow().waitForTimeout(1000)
    await this.puppeteer.getMetamaskWindow().bringToFront()

    if (!(await this.puppeteer.isDisplayed(this.unlockPO.unlockPage, 1500))) {
    // if ((await this.puppeteer.getMetamaskWindow().$(this.unlockPO.unlockPage)) === null) {
      await this.confirmWelcomePage()
      await this.importWallet(secretWordsOrPrivateKey, password)
      if (isCustomNetwork) {
          await this.addNetwork(network)
      } else {
          await this.changeNetwork(network)
      }
    } else {
      await this.unlock(password)
    }

    await this.closeWhatsNewPopupIfDisplayed()
    await this.readWalletAddress()
    await this.puppeteer.switchToCypressWindow()

    return true
  }

  async closeWhatsNewPopupIfDisplayed(): Promise<boolean> {
    if (await this.puppeteer.isDisplayed(this.whatsNewPopupPO.body, 2000)) {
      await this.puppeteer.waitAndClick(this.whatsNewPopupPO.closeButton)
    }

    return true
  }

  async getWalletAddress(): Promise<string> {
    return this.walletAddress.toLowerCase()
  }
}
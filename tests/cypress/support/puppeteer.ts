import { connect, Page, Browser } from 'puppeteer-core'
import axios from 'axios'
import { promisify } from 'util'
import { getDebuggerPort } from './global-context'

type Miliseconds = number

// quick fix to deal with expected type
interface DebuggerDetailsConfig {
    webSocketDebuggerUrl: string
}

let sleep = promisify(setTimeout)

// let port: string
// export function setPort(p: string) {
//   port = p
// }

export default class Puppeteer {

  private puppeteerBrowser: Browser
  private mainWindow: Page
  private metamaskWindow: Page

  getMainWindow(): Page {
    return this.mainWindow
  }

  getMetamaskWindow(): Page {
    return this.metamaskWindow
  }

  getWindows(): Array<Page> {
    return [
      this.mainWindow,
      this.metamaskWindow,
    ]
  }

  async init(): Promise<boolean> {
    let url = `http://localhost:${getDebuggerPort()}/json/version`
    const debuggerDetails = await axios.get(url)

    const debuggerDetailsConfig: DebuggerDetailsConfig = debuggerDetails.data as DebuggerDetailsConfig
    const webSocketDebuggerUrl = debuggerDetailsConfig.webSocketDebuggerUrl

    this.puppeteerBrowser = await connect({
      browserWSEndpoint: webSocketDebuggerUrl,
      ignoreHTTPSErrors: true,
      defaultViewport: null,
    })

    return this.puppeteerBrowser.isConnected()
  }

  async assignWindows(): Promise<boolean> {
    await this.waitForTabs(2)

    //todo wait until extension is loaded!
    let pages = await this.puppeteerBrowser.pages()

    if (pages.length < 2) {
      throw new Error("Extension wasn't loaded in time. Terminating")
    }

    for (const page of pages) {
      if (page.url().includes('integration')) {
        this.mainWindow = page
      } else if (page.url().includes('extension')) {
        this.metamaskWindow = page
      }
    }

    return true
  }

  async waitForTabs(count: number): Promise<boolean> {
    let attempt: number = 0
    let extensionLoaded: boolean = (await this.puppeteerBrowser.pages()).length == count
    while(!extensionLoaded && attempt++ < 10){
      await sleep(1000)
      extensionLoaded = (await this.puppeteerBrowser.pages()).length == count
    }

    if (!extensionLoaded) {
      throw new Error("Extension wasn't opened in 10s")
    }

    return true
  }

  async waitForTabNamed(name: string, timeout: Miliseconds = 3000, shouldThrow = false): Promise<boolean> {
    let endTime = new Date().getTime() + timeout
    let checkFn = async (browser: Browser, name: string) => { return (await browser.pages()).filter(v => { return v.url().includes(name)}) }
    let notificationShown: boolean = (await this.puppeteerBrowser.pages()).filter(v => { return v.url().includes(name)}).length == 1
    while(!notificationShown && new Date().getTime() < endTime){
      await sleep(200)
      notificationShown = (await checkFn(this.puppeteerBrowser, name)).length == 1
    }

    if (shouldThrow && !notificationShown) {
      throw new Error(`Notification window wasn't shown in ${timeout / 1000} seconds`)
    }

    return true
  }

  async closePageNamed(name: string): Promise<boolean> {
    let pages = await this.puppeteerBrowser.pages()
    for (const page of pages) {
      if (page.url().includes(name)) {
        page.close()
        return true
      }
    }

    return false
  }

  async switchToCypressWindow(): Promise<boolean> {
    await this.mainWindow.bringToFront()
    return true
  }

  async switchToMetamaskWindow(): Promise<boolean> {
    await this.metamaskWindow.bringToFront()
    return true
  }

  async isMetamaskNotificationDisplayed(timeout: Miliseconds = 5000): Promise<boolean> {
    await this.waitForTabNamed('notification', timeout)
    let pages = await this.puppeteerBrowser.pages()
    for (const page of pages) {
      if (page.url().includes('notification')) {
        return true
      }
    }

    return false
  }

  async switchToMetamaskNotification(): Promise<Page> {
    await this.isMetamaskNotificationDisplayed()
    let pages = await this.puppeteerBrowser.pages()
    for (const page of pages) {
      if (page.url().includes('notification')) {
        await page.bringToFront()

        return page
      }
    }

    throw new Error('No notification found')
  }

  async isDisplayed(selector: string, timeout: Miliseconds = 3000, page: Page = this.metamaskWindow): Promise<boolean> {
      try {
        await page.waitForSelector(
          selector,
          {timeout: timeout, visible: true }
        )
        return true
      } catch(e) {
        return false
      }
  }

  async waitFor(selector: string, page: Page = this.metamaskWindow) {
    await page.waitForFunction(
      `document.querySelector('${selector}') && document.querySelector('${selector}').clientHeight != 0`,
      {timeout: 10000, polling: 500 }
    )
    // puppeteer going too fast breaks metamask in corner cases
    await page.waitForTimeout(300)
  }

  async changeAccount(number: number, page: Page = this.metamaskWindow) {
    await page.evaluate(
      ({ number }) => {
        const selector = document.querySelector('.account-menu__accounts').children[number.number - 1] as HTMLElement
        selector.click()
      },
      { number }
    )
  }

  async waitAndClick(selector: string, page: Page = this.metamaskWindow) {
    await this.waitFor(selector, page)
    await page.evaluate(
      (selector: string) => (document.querySelector(selector) as HTMLElement).click(),
      selector,
    )
  }

  async waitAndClickByText(selector: string, elementText: string, page: Page = this.metamaskWindow) {
    await this.waitFor(selector, page)
    await page.evaluate(
      ({ elementText, selector }) => {
        const selectors = document.querySelectorAll(selector)
        const importNode = Array.from(selectors).find(
          (selector) => selector.innerText === elementText
        )
        importNode.click()
      },
      { elementText, selector }
    )
  }

  async waitAndType(selector: string, value: string, page: Page = this.metamaskWindow) {
    await this.waitFor(selector, page)
    const element = await page.$(selector)
    await element.type(value)
  }

  async waitAndGetValue(selector: string, page: Page = this.metamaskWindow): Promise<string> {
    await this.waitFor(selector, page)
    const element = await page.$(selector)
    const property = await element.getProperty('value')
    const value = await property.jsonValue()

    return value as string
  }

  async waitAndSetValue(text: string, selector: string, page: Page = this.metamaskWindow) {
    await this.waitFor(selector, page)
    await page.evaluate(
      selector => (document.querySelector(selector).value = ''),
      selector,
    )
    await page.focus(selector)
    await page.keyboard.type(text)
  }

  async waitForText(selector: string, text: string, page: Page = this.metamaskWindow) {
    await this.waitFor(selector, page)
    await page.waitForFunction(
      `document.querySelector('${selector}').innerText.toLowerCase().includes('${text}')`,
    )
  }
}
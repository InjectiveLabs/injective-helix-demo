import axios from 'axios'
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { unzip } from 'cross-zip'
import { join, resolve } from 'path'

let networkName = 'mainnet'
let networkId = 1
let isTestnet = false

interface NetworkData {
  networkName: String
  networkId: number
  isTestnet: boolean
}

export default class Helpers {
  setNetworkConfiguration(network: any) {
    if (network === 'main' || network === 'mainnet' || network === 1) {
      networkName = 'mainnet'
      networkId = 1
      isTestnet = false
    } else if (network === 'ropsten') {
      networkName = 'ropsten'
      networkId = 3
      isTestnet = true
    } else if (network === 'kovan') {
      networkName = 'kovan'
      networkId = 42
      isTestnet = true
    } else if (network === 'rinkeby') {
      networkName = 'rinkeby'
      networkId = 4
      isTestnet = true
    } else if (network === 'goerli') {
      networkName = 'goerli'
      networkId = 5
      isTestnet = true
    } else if (typeof network === 'object') {
      networkName = network.networkName
      networkId = network.chainId
      isTestnet = network.isTestnet
    }
    // todo: handle a case when setNetwork() is triggered by changeNetwork() with a string of already added custom networks
  }

  getNetwork(): NetworkData {
    return { networkName, networkId, isTestnet }
  }

  async getMetamaskReleases(version: string) {
    let filename: string
    let downloadUrl: string

    const response = await axios.get(
      'https://api.github.com/repos/metamask/metamask-extension/releases',
    )

    if (version === 'latest' || !version) {
      filename = response.data[0].assets[0].name
      downloadUrl = response.data[0].assets[0].browser_download_url
    } else if (version) {
      filename = `metamask-chrome-${version}.zip`
      downloadUrl = `https://github.com/MetaMask/metamask-extension/releases/download/v${version}/metamask-chrome-${version}.zip`
    }

    return {
      filename,
      downloadUrl,
    }
  }

  async download(url: string, destination: string) {
    const writer = createWriteStream(destination)
    const result = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    })
    await new Promise(resolve =>
      result.data.pipe(writer).on('finish', resolve),
    )
  }

  async extract(file: string, destination: string) {
    unzip(file, destination)
  }

  async prepareMetamask(version: string) {
    const release = await this.getMetamaskReleases(version)
    const downloadsDirectory = resolve(__dirname, 'downloads')
    if (!existsSync(downloadsDirectory)) {
      mkdirSync(downloadsDirectory)
    }
    const downloadDestination = join(downloadsDirectory, release.filename)
    await this.download(release.downloadUrl, downloadDestination)
    const metamaskDirectory = join(downloadsDirectory, 'metamask')
    await this.extract(downloadDestination, metamaskDirectory)
    return metamaskDirectory
  }
  
}
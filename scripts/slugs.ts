/* eslint-disable no-console */
import { writeFileSync } from 'node:fs'
import { HttpClient } from '@injectivelabs/utils'
import {
  Network,
  isDevnet,
  isTestnet,
  isMainnet
} from '@injectivelabs/networks'

const NETWORK: Network = process.env.VITE_NETWORK as Network
const IS_STAGING = process.env.VITE_ENV === 'staging'
const IS_DEVNET: boolean = isDevnet(NETWORK)
const IS_TESTNET: boolean = isTestnet(NETWORK)
const IS_MAINNET: boolean = isMainnet(NETWORK)

const getFilePath = (): string => {
  if (IS_DEVNET) {
    return 'devnet.json'
  }

  if (IS_TESTNET) {
    return 'testnet.json'
  }

  if (IS_MAINNET && IS_STAGING) {
    return 'staging.json'
  }

  return 'mainnet.json'
}

export const fetchMarketCategorySlugs = async (): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/helix/trading/market/'
  )

  try {
    const { data: slugs } = (await client.get('category.json')) as {
      data: {
        cosmosCategorySlugs: string[]
        solanaCategorySlugs: string[]
        ethereumCategorySlugs: string[]
        injectiveCategorySlugs: string[]
        newMarketsCategorySlugs: string[]
        olpLowVolumeCategorySlugs: string[]
        experimentalCategorySlugs: string[]
      }
    }

    writeFileSync('app/data/category.json', JSON.stringify(slugs, null, '\t'))

    console.log('✅✅✅ fetchMarketCategorySlugs')
  } catch (err) {
    console.log('fetchMarketCategorySlugs', err)
    throw err
  }
}

export const fetchExpiryFuturesMarketSlugs = async (): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/helix/trading/expiry/'
  )

  const filePath = getFilePath()

  try {
    const { data: slugs } = (await client.get(filePath)) as {
      data: string[]
    }

    writeFileSync('app/data/expiry.json', JSON.stringify(slugs, null, '\t'))

    console.log('✅✅✅ fetchExpiryFuturesMarketSlugs')
  } catch (err: any) {
    console.error('fetchExpiryFuturesMarketSlugs')
    throw err
  }
}

export const fetchDerivativeMarketSlugs = async (): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/helix/trading/derivative/'
  )

  const filePath = getFilePath()

  try {
    const { data: slugs } = (await client.get(filePath)) as {
      data: string[]
    }

    writeFileSync('app/data/derivative.json', JSON.stringify(slugs, null, '\t'))

    console.log('✅✅✅ fetchDerivativeMarketSlugs')
  } catch (err) {
    console.error('fetchDerivativeMarketSlugs', err)
    throw err
  }
}

export const fetchSpotMarketSlugs = async (): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/helix/trading/spot/'
  )

  const filePath = getFilePath()

  try {
    const { data: slugs } = (await client.get(filePath)) as {
      data: string[]
    }

    writeFileSync('app/data/spot.json', JSON.stringify(slugs, null, '\t'))

    console.log('✅✅✅ fetchSpotMarketSlugs')
  } catch (err) {
    console.error('fetchSpotMarketSlugs', err)
    throw err
  }
}

fetchSpotMarketSlugs()
fetchMarketCategorySlugs()
fetchDerivativeMarketSlugs()
fetchExpiryFuturesMarketSlugs()

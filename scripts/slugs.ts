/* eslint-disable no-console */
import { HttpClient } from '@injectivelabs/utils'
import { storeJsonFile } from './helper'

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

    storeJsonFile('app/json/marketCategories.json', slugs)

    console.log('✅✅✅ Market categories')
  } catch (err) {
    console.log('❌❌❌ Market categories')
    throw err
  }
}

export const fetchSpotMarketSlugs = async (fileName: string): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/helix/trading/spot/'
  )

  try {
    const { data: slugs } = (await client.get(fileName)) as {
      data: string[]
    }

    storeJsonFile(`app/json/slugs/spot/${fileName}`, slugs)

    console.log(`✅✅✅ Spot slugs - ${fileName}`)
  } catch (err) {
    console.error(`❌❌❌ Spot slugs - ${fileName}`)

    throw err
  }
}

export const fetchDerivativeMarketSlugs = async (
  fileName: string
): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/helix/trading/derivative/'
  )

  try {
    const { data: slugs } = (await client.get(fileName)) as {
      data: string[]
    }

    storeJsonFile(`app/json/slugs/derivative/${fileName}`, slugs)

    console.log(`✅✅✅ Derivative slugs - ${fileName}`)
  } catch (err) {
    console.error(`❌❌❌ Derivative slugs - ${fileName}`)

    throw err
  }
}

export const fetchExpiryFuturesMarketSlugs = async (
  fileName: string
): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/helix/trading/expiry/'
  )

  try {
    const { data: slugs } = (await client.get(fileName)) as {
      data: string[]
    }

    storeJsonFile(`app/json/slugs/expiry/${fileName}`, slugs)

    console.log(`✅✅✅ Expiry future market slugs - ${fileName}`)
  } catch (err) {
    console.error(`❌❌❌ Expiry future market slugs - ${fileName}`)

    throw err
  }
}

export const fetchSpotGridMarkets = async (fileName: string): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/helix/trading/gridMarkets/spot/'
  )

  try {
    const { data: gridContracts } = (await client.get(fileName)) as {
      data: string[]
    }

    storeJsonFile(`app/json/grid/spot/${fileName}`, gridContracts)

    console.log(`✅✅✅ Spot grid markets - ${fileName}`)
  } catch (err) {
    console.error(`❌❌❌ Spot grid markets - ${fileName}`)

    throw err
  }
}

export const fetchDerivativeGridMarkets = async (
  fileName: string
): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/helix/trading/gridMarkets/derivative/'
  )

  try {
    const { data: gridContracts } = (await client.get(fileName)) as {
      data: string[]
    }

    storeJsonFile(`app/json/grid/derivative/${fileName}`, gridContracts)

    console.log(`✅✅✅ Derivative grid markets - ${fileName}`)
  } catch (err) {
    console.error(`❌❌❌ Derivative grid markets - ${fileName}`)

    throw err
  }
}

fetchMarketCategorySlugs()

fetchSpotMarketSlugs('devnet.json')
fetchSpotMarketSlugs('testnet.json')
fetchSpotMarketSlugs('staging.json')
fetchSpotMarketSlugs('mainnet.json')

fetchDerivativeMarketSlugs('devnet.json')
fetchDerivativeMarketSlugs('testnet.json')
fetchDerivativeMarketSlugs('staging.json')
fetchDerivativeMarketSlugs('mainnet.json')

fetchExpiryFuturesMarketSlugs('devnet.json')
fetchExpiryFuturesMarketSlugs('testnet.json')
fetchExpiryFuturesMarketSlugs('staging.json')
fetchExpiryFuturesMarketSlugs('mainnet.json')

fetchSpotGridMarkets('devnet.json')
fetchSpotGridMarkets('testnet.json')
fetchSpotGridMarkets('staging.json')
fetchSpotGridMarkets('mainnet.json')

fetchDerivativeGridMarkets('devnet.json')
fetchDerivativeGridMarkets('testnet.json')
fetchDerivativeGridMarkets('staging.json')
fetchDerivativeGridMarkets('mainnet.json')

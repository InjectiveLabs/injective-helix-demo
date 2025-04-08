/* eslint-disable no-console */
import { HttpClient } from '@injectivelabs/utils'
import { storeJsonFile } from './helper'

export const fetchMarketCategoryMap = async (
  fileName: string
): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/json/helix/trading/market/categoryMap/'
  )

  try {
    const { data: slugs } = (await client.get(fileName)) as {
      data: any
    }

    storeJsonFile(`app/json/marketMap/category/${fileName}`, slugs)

    console.log('✅✅✅ Market categories')
  } catch (err) {
    console.log('❌❌❌ Market categories')
    throw err
  }
}

export const fetchSpotMarketMap = async (fileName: string): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/json/helix/trading/spotMap/'
  )

  try {
    const { data: marketMap } = (await client.get(fileName)) as {
      data: Record<string, string>
    }

    storeJsonFile(`app/json/marketMap/spot/${fileName}`, marketMap)

    console.log(`✅✅✅ Spot market map - ${fileName}`)
  } catch (err) {
    console.error(`❌❌❌ Spot market map - ${fileName}`)

    throw err
  }
}

export const fetchDerivativeMarketMap = async (
  fileName: string
): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/json/helix/trading/derivativeMap/'
  )

  try {
    const { data: marketMap } = (await client.get(fileName)) as {
      data: Record<string, string>
    }

    storeJsonFile(`app/json/marketMap/derivative/${fileName}`, marketMap)

    console.log(`✅✅✅ Derivative market map - ${fileName}`)
  } catch (err) {
    console.error(`❌❌❌ Derivative market map - ${fileName}`)

    throw err
  }
}

export const fetchExpiryFuturesMarketIds = async (
  fileName: string
): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/json/helix/trading/expiryMap/'
  )

  try {
    const { data: marketMap } = (await client.get(fileName)) as {
      data: Record<string, string>
    }

    storeJsonFile(`app/json/marketMap/expiry/${fileName}`, marketMap)

    console.log(`✅✅✅ Expiry future market ids - ${fileName}`)
  } catch (err) {
    console.error(`❌❌❌ Expiry future market ids - ${fileName}`)

    throw err
  }
}

export const fetchSpotGridMarkets = async (fileName: string): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/json/helix/trading/gridMarkets/spot/'
  )

  try {
    const { data: gridContracts } = (await client.get(fileName)) as {
      data: any
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
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/json/helix/trading/gridMarkets/derivative/'
  )

  try {
    const { data: gridContracts } = (await client.get(fileName)) as {
      data: any
    }

    storeJsonFile(`app/json/grid/derivative/${fileName}`, gridContracts)

    console.log(`✅✅✅ Derivative grid markets - ${fileName}`)
  } catch (err) {
    console.error(`❌❌❌ Derivative grid markets - ${fileName}`)

    throw err
  }
}

fetchMarketCategoryMap('devnet.json')
fetchMarketCategoryMap('testnet.json')
fetchMarketCategoryMap('mainnet.json')

fetchSpotMarketMap('devnet.json')
fetchSpotMarketMap('testnet.json')
fetchSpotMarketMap('mainnet.json')

fetchDerivativeMarketMap('devnet.json')
fetchDerivativeMarketMap('testnet.json')
fetchDerivativeMarketMap('mainnet.json')

fetchExpiryFuturesMarketIds('devnet.json')
fetchExpiryFuturesMarketIds('testnet.json')
fetchExpiryFuturesMarketIds('mainnet.json')

fetchSpotGridMarkets('devnet.json')
fetchSpotGridMarkets('testnet.json')
fetchSpotGridMarkets('mainnet.json')

fetchDerivativeGridMarkets('devnet.json')
fetchDerivativeGridMarkets('testnet.json')
fetchDerivativeGridMarkets('mainnet.json')

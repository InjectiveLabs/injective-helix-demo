import { CoinGeckoApiService } from './CoinGeckoApi'
import { Network, isDevnet, isTestnet } from '@injectivelabs/networks'
import {
  sleep,
  HttpRestClient,
  BigNumberInBase,
  splitArrayToChunks
} from '@injectivelabs/utils'

interface TokenStaticWithPrice {
  denom: string
  coingecko_id: string
  price: {
    price: number
    metadata: {
      source: string
      height: number
      market_id: string
      market_price: number
    }
  }
}

const ASSET_PRICE_SERVICE_URL =
  'https://k8s.global.mainnet.asset.injective.network/asset-price/v1'
// 'https://k8s.mainnet.asset.injective.network/asset-price/v1'
const TESTNET_ASSET_PRICE_SERVICE_URL =
  'https://k8s.testnet.asset.injective.network/asset-price/v1'
// const DEVNET_ASSET_PRICE_SERVICE_URL =
//   'https://devnet.api.injective.dev/asset-price/v1'

const whiteListedCoinGeckoIds: string[] = []

const getAssetMicroserviceEndpoint = (network: Network = Network.Mainnet) => {
  if (isTestnet(network)) {
    return TESTNET_ASSET_PRICE_SERVICE_URL
  }

  if (isDevnet(network)) {
    return ASSET_PRICE_SERVICE_URL
  }

  return ASSET_PRICE_SERVICE_URL
}

export class TokenPrice {
  private coinGeckoApi: undefined | CoinGeckoApiService
  private client: HttpRestClient

  constructor(
    network: Network,
    coinGeckoOptions: {
      apiKey: string
      baseUrl: string
    }
  ) {
    this.coinGeckoApi = new CoinGeckoApiService(coinGeckoOptions)
    this.client = new HttpRestClient(getAssetMicroserviceEndpoint(network), {
      timeout: 30_000
    })
  }

  async fetchUsdTokensPrice(coinGeckoIds: string[] = []) {
    const response = await this.client.retry<{
      data: Record<string, TokenStaticWithPrice>
    }>(() => this.client.get(`denoms?withPrice=true&onlyActive=true`))

    const tokenPriceMap: Record<string, number> = Object.values(
      response.data
    ).reduce(
      (prices, tokenWithPrice) => {
        const id = tokenWithPrice.coingecko_id || tokenWithPrice.denom

        if (prices[id]) {
          return prices
        }

        prices[id] = tokenWithPrice.price.price

        return prices
      },
      {} as Record<string, number>
    )

    const coinGeckoIdsToFetch = coinGeckoIds.filter(
      (coinGeckoId) => !tokenPriceMap[coinGeckoId]
    )

    if (coinGeckoIdsToFetch.length === 0) {
      return tokenPriceMap
    }

    const { denomPriceMap, coinGeckoIdList } = coinGeckoIdsToFetch.reduce(
      (lists, coinGeckoId: string) => {
        const isDenomFormat =
          coinGeckoId.startsWith('ibc/') ||
          coinGeckoId.startsWith('peggy') ||
          coinGeckoId.startsWith('share') ||
          coinGeckoId.startsWith('factory/')

        if (isDenomFormat) {
          return {
            ...lists,
            denomPriceMap: { ...lists.denomPriceMap, [coinGeckoId]: 0 }
          }
        }

        return {
          ...lists,
          coinGeckoIdList: [...lists.coinGeckoIdList, coinGeckoId]
        }
      },
      { denomPriceMap: {}, coinGeckoIdList: [] } as {
        coinGeckoIdList: string[]
        denomPriceMap: Record<string, number>
      }
    )

    const whiteListedCoinGeckoIdsToFetch = coinGeckoIdList.filter(
      (coinGeckoId) => whiteListedCoinGeckoIds.includes(coinGeckoId)
    )

    const coinGeckoIdsPriceMap =
      await this.fetchUsdTokenPriceFromCoinGeckoInChunks(
        whiteListedCoinGeckoIdsToFetch
      )

    const formattedCoinGeckoIdsPriceMap = Object.entries(
      coinGeckoIdsPriceMap
    ).reduce(
      (list, [key, value]) => ({ ...list, [key.toLowerCase()]: value }),
      {} as Record<string, number>
    )

    return {
      ...tokenPriceMap,
      ...formattedCoinGeckoIdsPriceMap,
      ...denomPriceMap
    }
  }

  private fetchUsdTokenPriceFromCoinGeckoInChunks = async (
    coinIds: string[]
  ) => {
    const CHUNK_SIZE = 5
    const chunks = splitArrayToChunks({
      array: coinIds,
      chunkSize: CHUNK_SIZE,
      filter: (c) => !!c
    })

    /**
     * We make chunks to ensure that we don't hit the
     * rate limits on CoinGecko by querying multiple
     * prices at the same time as we do multiple
     * calls at the same time
     */
    const response = await Promise.all(
      chunks.map(async (chunk, index) => {
        const prices = {} as Record<string, number>

        for (let i = 0; i < chunk.length; i += 1) {
          const price = await this.fetchUsdTokenPriceFromCoinGeckoNoThrow(
            chunk[i]
          )

          prices[chunk[i]] = price
        }

        if (index < chunks.length - 1) {
          await sleep(500)
        }

        return prices
      })
    )

    const prices = response.reduce(
      (prices, chunkResponse) => ({ ...prices, ...chunkResponse }),
      {} as Record<string, number>
    )

    return prices
  }

  private fetchUsdTokenPriceFromCoinGeckoNoThrow = async (coinId: string) => {
    if (!coinId) {
      return 0
    }

    if (!this.coinGeckoApi) {
      return 0
    }

    try {
      const priceInUsd = await this.coinGeckoApi.fetchUsdPrice(coinId)

      if (!priceInUsd) {
        return 0
      }

      return new BigNumberInBase(priceInUsd).toNumber()
    } catch (e: unknown) {
      return 0
    }
  }
}

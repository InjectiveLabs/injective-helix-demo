import { defineStore } from 'pinia'
import { INJ_COIN_GECKO_ID, UiBankTransformer } from '@injectivelabs/sdk-ui-ts'
import type { Token } from '@injectivelabs/token-metadata'
import { bankApi, tokenPrice, tokenService } from '@/app/Services'
import { BTC_COIN_GECKO_ID } from '@/app/utils/constants'
import { TokenUsdPriceMap } from '@/types'

type TokenStoreState = {
  tokens: Token[]
  btcUsdPrice: number
  injUsdPrice: number
  tokenUsdPriceMap: TokenUsdPriceMap
}

const initialStateFactory = (): TokenStoreState => ({
  tokens: [],
  btcUsdPrice: 0,
  injUsdPrice: 0,
  tokenUsdPriceMap: {}
})

export const useTokenStore = defineStore('token', {
  state: (): TokenStoreState => initialStateFactory(),
  getters: {
    tokenUsdPrice: (state) => (coinGeckoId: string) => {
      return state.tokenUsdPriceMap[coinGeckoId] || 0
    },

    tradeableTokens: (state) => {
      const derivativeStore = useDerivativeStore()
      const spotStore = useSpotStore()

      const tradeableDenoms = [
        ...new Set([
          ...derivativeStore.tradeableDenoms,
          ...spotStore.tradeableDenoms
        ])
      ]

      return state.tokens.filter((token) => {
        return tradeableDenoms.includes(token.denom)
      })
    }
  },
  actions: {
    async fetchTokensUsdPriceMap(coinGeckoIdList: string[]) {
      const tokenStore = useTokenStore()

      if (coinGeckoIdList.length === 0) {
        return
      }

      const coinGeckoIdsNotInStore = [
        ...new Set(coinGeckoIdList.filter((id) => id))
      ].filter(
        (coinGeckoId) =>
          !Object.keys(tokenStore.tokenUsdPriceMap).includes(coinGeckoId)
      )

      const tokenUsdPriceMap = await tokenPrice.fetchUsdTokensPrice(
        coinGeckoIdsNotInStore
      )

      tokenStore.$patch({
        tokenUsdPriceMap: {
          ...tokenUsdPriceMap,
          ...tokenStore.tokenUsdPriceMap
        }
      })
    },

    async fetchInjUsdPrice() {
      const tokenStore = useTokenStore()

      tokenStore.$patch({
        injUsdPrice: await tokenPrice.fetchUsdTokenPrice(INJ_COIN_GECKO_ID)
      })
    },

    async fetchBitcoinUsdPrice() {
      const tokenStore = useTokenStore()

      tokenStore.$patch({
        btcUsdPrice: await tokenPrice.fetchUsdTokenPrice(BTC_COIN_GECKO_ID)
      })
    },

    async fetchSupplyTokenMeta() {
      const tokenStore = useTokenStore()

      const { supply } = await bankApi.fetchTotalSupply({ limit: 200 })

      const { bankSupply, ibcBankSupply } =
        UiBankTransformer.supplyToUiSupply(supply)

      const tokens = await tokenService.toCoinsWithToken([
        ...bankSupply,
        ...ibcBankSupply
      ])

      tokenStore.$patch({
        tokens
      })
    },

    getTradeableTokensPriceMap() {
      const tokenStore = useTokenStore()

      tokenStore.fetchTokensUsdPriceMap(
        tokenStore.tradeableTokens.map((token) => token.coinGeckoId)
      )
    }
  }
})

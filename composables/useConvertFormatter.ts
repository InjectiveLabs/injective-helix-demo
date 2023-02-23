import type { Ref } from 'vue'
import { Token } from '@injectivelabs/token-metadata'
import {
  SpotOrderSide,
  BalanceWithToken,
  UiSpotMarketWithToken,
  BalanceWithTokenAndPrice
} from '@injectivelabs/sdk-ui-ts'

const getBalanceWithToken = (
  token: Token,
  balances: BalanceWithTokenAndPrice[]
) => {
  const defaultBalanceWithToken = {
    token,
    denom: token.denom,
    balance: '0'
  }

  const balanceWithToken = balances.find(({ denom }) => denom === token.denom)

  return balanceWithToken || defaultBalanceWithToken
}

export default function useConvertFormatter(
  balances: Ref<BalanceWithTokenAndPrice[]>
) {
  const spotStore = useSpotStore()

  const tradableSlugMap = computed(() => {
    return spotStore.markets.reduce((list, market) => {
      const reversedSlug = market.slug.split('-').reverse().join('-')

      return {
        ...list,
        [market.slug]: { orderType: SpotOrderSide.Sell, market },
        [reversedSlug]: { orderType: SpotOrderSide.Buy, market }
      }
    }, {} as Record<string, { orderType: SpotOrderSide; market: UiSpotMarketWithToken }>)
  })

  const tradableTokenMaps = computed(() => {
    return spotStore.markets.reduce((tokens, market) => {
      const baseTokenWithBalance = getBalanceWithToken(
        market.baseToken,
        balances.value
      )

      const quoteTokenWithBalance = getBalanceWithToken(
        market.quoteToken,
        balances.value
      )

      const baseTokens = tokens[market.quoteDenom]
        ? [...tokens[market.quoteDenom], baseTokenWithBalance]
        : [baseTokenWithBalance]

      const quoteToken = tokens[market.baseDenom]
        ? [...tokens[market.baseDenom], quoteTokenWithBalance]
        : [quoteTokenWithBalance]

      return {
        ...tokens,
        [market.quoteDenom]: baseTokens,
        [market.baseDenom]: quoteToken
      }
    }, {} as Record<string, BalanceWithToken[]>)
  })

  return {
    tradableSlugMap,
    tradableTokenMaps
  }
}

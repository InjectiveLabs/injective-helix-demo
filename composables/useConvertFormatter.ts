import { SpotOrderSide, UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { getSubaccountTokenWithBalance } from '@/app/utils/balance'
import { BalanceWithToken } from '@/types'

export default function useConvertFormatter() {
  const accountStore = useAccountStore()
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
      const baseTokenWithBalance = getSubaccountTokenWithBalance(
        market.baseToken,
        accountStore.subaccount
      )

      const quoteTokenWithBalance = getSubaccountTokenWithBalance(
        market.quoteToken,
        accountStore.subaccount
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

  /* todo: verify if showing the current token price is necessary */
  // const fetchTokenPairUsdValue = (market: UiSpotMarketWithToken) => {
  //   return Promise.all([
  //     tokenPrice.fetchUsdTokenPrice(market.baseToken.coinGeckoId),
  //     tokenPrice.fetchUsdTokenPrice(market.quoteToken.coinGeckoId)
  //   ])
  // }

  return {
    tradableSlugMap,
    tradableTokenMaps
  }
}

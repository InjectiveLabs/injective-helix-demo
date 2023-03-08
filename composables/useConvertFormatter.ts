import {
  SpotOrderSide,
  BalanceWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { getSubaccountTokenWithBalance } from '@/app/utils/balance'

export default function useConvertFormatter() {
  const accountStore = useAccountStore()
  const spotStore = useSpotStore()

  const tradableSlugMap = computed(() => {
    return [
      ...spotStore.markets,
      ...spotStore.usdcConversionModalMarkets
    ].reduce((list, market) => {
      const reversedSlug = market.slug.split('-').reverse().join('-')

      return {
        ...list,
        [market.slug]: { orderType: SpotOrderSide.Sell, market },
        [reversedSlug]: { orderType: SpotOrderSide.Buy, market }
      }
    }, {} as Record<string, { orderType: SpotOrderSide; market: UiSpotMarketWithToken }>)
  })

  const availableQuoteDenoms = computed(() =>
    [...spotStore.markets, ...spotStore.usdcConversionModalMarkets].reduce(
      (tokens, market) => {
        const quoteTokenWithBalance = getSubaccountTokenWithBalance(
          market.quoteToken,
          accountStore.subaccount
        )

        // remove duplicate USDT keys
        const quoteTokenExistOnTokensList = tokens.some(
          (token) => token.denom === quoteTokenWithBalance.denom
        )

        return quoteTokenExistOnTokensList
          ? tokens
          : [quoteTokenWithBalance, ...tokens]
      },
      [] as BalanceWithToken[]
    )
  )

  const tradableTokenMaps = computed(() => {
    return [
      ...spotStore.markets,
      ...spotStore.usdcConversionModalMarkets
    ].reduce((tokens, market) => {
      const baseTokenWithBalance = getSubaccountTokenWithBalance(
        market.baseToken,
        accountStore.subaccount
      )

      // filter out USDT from the base tokens
      const baseTokens = tokens[market.quoteDenom]
        ? [...tokens[market.quoteDenom], baseTokenWithBalance].filter(
            ({ denom }) => denom !== market.quoteDenom
          )
        : [baseTokenWithBalance]

      const quoteToken = tokens[market.baseDenom]
        ? [...tokens[market.baseDenom], ...availableQuoteDenoms.value]
        : availableQuoteDenoms.value

      return {
        ...tokens,
        [market.quoteDenom]: baseTokens,
        [market.baseDenom]: quoteToken
      }
    }, {} as Record<string, BalanceWithToken[]>)
  })

  function getMarketsForQuoteDenom({
    baseTokenDenom,
    quoteTokenDenom
  }: {
    baseTokenDenom: string
    quoteTokenDenom: string
  }) {
    const existingMarket = spotStore.markets.find(
      ({ baseDenom, quoteDenom }) => {
        const foundBaseTokenDenom = [quoteDenom, baseDenom].includes(
          baseTokenDenom
        )
        const foundQuoteTokenDenom = [quoteDenom, baseDenom].includes(
          quoteTokenDenom
        )

        return foundBaseTokenDenom && foundQuoteTokenDenom
      }
    )

    if (existingMarket) {
      return existingMarket
    }

    const defaultMarket = spotStore.markets.find(({ quoteDenom }) =>
      [baseTokenDenom, quoteTokenDenom].includes(quoteDenom)
    )

    return defaultMarket || spotStore.markets[0]
  }

  return {
    tradableSlugMap,
    tradableTokenMaps,
    getMarketsForQuoteDenom
  }
}

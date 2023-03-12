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

  const tradableTokensMap = computed(() => {
    return [
      ...spotStore.markets,
      ...spotStore.usdcConversionModalMarkets
    ].reduce((tokens, market) => {
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
        ? [...tokens[market.baseDenom], ...availableQuoteDenoms.value]
        : availableQuoteDenoms.value

      const tokenCanBeBaseOrQuote = availableQuoteDenoms.value.some(
        ({ denom }) => denom === market.baseDenom
      )

      /**
       * For markets where the base could also be the quote for another market, we only need to add the corresponding quoteTokenWithBalance
       * I.E. USDT/USDCet where USDT is base, but could also be the quote for an INJ/USDT market
       */
      return {
        ...tokens,
        [market.quoteDenom]: baseTokens,
        [market.baseDenom]: !tokenCanBeBaseOrQuote
          ? quoteToken
          : [quoteTokenWithBalance]
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
    tradableTokensMap,
    getMarketsForQuoteDenom
  }
}

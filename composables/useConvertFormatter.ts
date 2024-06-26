import { OrderSide } from '@injectivelabs/ts-types'
import { TokenStatic } from '@injectivelabs/sdk-ts'
import { UiSpotMarket } from '@/types'

export default function useConvertFormatter() {
  const spotStore = useSpotStore()

  const tradableSlugMap = computed(() => {
    return [...spotStore.markets].reduce(
      (list, market) => {
        const reversedSlug = market.slug.split('-').reverse().join('-')

        return {
          ...list,
          [market.slug]: { orderType: OrderSide.Sell, market },
          [reversedSlug]: { orderType: OrderSide.Buy, market }
        }
      },
      {} as Record<string, { orderType: OrderSide; market: UiSpotMarket }>
    )
  })

  const availableQuoteDenoms = computed(() =>
    [...spotStore.markets].reduce((tokens, market) => {
      // remove duplicate USDT keys
      const quoteTokenExistOnTokensList = tokens.some(
        (token) => token.denom === market.quoteDenom
      )

      return quoteTokenExistOnTokensList
        ? tokens
        : [market.quoteToken, ...tokens]
    }, [] as TokenStatic[])
  )

  const tradableTokensMap = computed(() => {
    return [...spotStore.markets].reduce(
      (tokens, market) => {
        const baseTokens = tokens[market.quoteDenom]
          ? [...tokens[market.quoteDenom], market.baseToken]
          : [market.baseToken]

        /**
         * For markets where the base could also be the quote for another market, we only need to add the denoms
         * which are not the base of the current market
         * I.E. USDT/USDCet where USDT is base, but could also be the quote for an INJ/USDT market
         */
        const filteredAvailableQuoteDenoms = availableQuoteDenoms.value.filter(
          (token) => token.denom !== market.baseDenom
        )

        const quoteToken = tokens[market.baseDenom]
          ? [...tokens[market.baseDenom], ...filteredAvailableQuoteDenoms]
          : filteredAvailableQuoteDenoms

        return {
          ...tokens,
          [market.quoteDenom]: baseTokens,
          [market.baseDenom]: quoteToken
        }
      },
      {} as Record<string, TokenStatic[]>
    )
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

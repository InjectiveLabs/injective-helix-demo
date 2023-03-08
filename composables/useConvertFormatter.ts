import { Ref } from 'vue'
import {
  SpotOrderSide,
  BalanceWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'

export const getSubaccountTokenWithBalance = (
  token: Token,
  balances: Ref<BalanceWithToken[]>
): BalanceWithToken => {
  const defaultBalance: BalanceWithToken = {
    token,
    denom: token.denom,
    balance: '0'
  }

  if (balances.value.length === 0) {
    return defaultBalance
  }

  const accountBalance = balances.value.find(
    ({ denom }) => denom === token.denom
  )

  if (!accountBalance) {
    return defaultBalance
  }

  return {
    ...defaultBalance,
    balance: accountBalance.balance
  }
}

export default function useConvertFormatter(balances: Ref<BalanceWithToken[]>) {
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
          balances
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
        balances
      )
      const quoteTokenWithBalance = getSubaccountTokenWithBalance(
        market.quoteToken,
        balances
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

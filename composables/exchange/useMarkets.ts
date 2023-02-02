export function useMarketTradeableDenoms() {
  const derivativeStore = useDerivativeStore()
  const spotStore = useSpotStore()

  const tradeableDenoms = computed(() => {
    const tradeableDerivativeDenoms = derivativeStore.markets.map((market) => {
      return market.quoteDenom
    })
    const tradeableSpotDenoms = spotStore.markets.reduce((denoms, market) => {
      return [...denoms, market.baseDenom, market.quoteDenom]
    }, [] as string[])

    return [...tradeableDerivativeDenoms, ...tradeableSpotDenoms].reduce(
      (denoms, denom) => {
        if (denoms.includes(denom)) {
          return denoms
        }

        return [...denoms, denom]
      },
      [] as string[]
    )
  })

  return {
    tradeableDenoms
  }
}

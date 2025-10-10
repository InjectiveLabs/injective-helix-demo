import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import type { TokenStatic } from '@injectivelabs/sdk-ts'

export function useSpotRoi(token: TokenStatic) {
  const spotStore = useSpotStore()
  const sharedSpotStore = useSharedSpotStore()
  const sharedTokenStore = useSharedTokenStore()

  return computed(() => {
    const currentTokenUsdPrice = sharedTokenStore.tokenUsdPrice(token)
    if (!currentTokenUsdPrice) {
      return
    }

    const markets = sharedSpotStore.marketsWithToken.filter(
      (market) => market.baseDenom === token.denom
    )

    let totalQuantity = ZERO_IN_BASE
    let totalCostBasis = ZERO_IN_BASE

    for (const market of markets) {
      const averageEntry = spotStore.accountAverageEntries[market.marketId]

      if (!averageEntry) {
        continue
      }

      const quantity = new BigNumberInBase(averageEntry.quantity || 0)
      const usdValue = new BigNumberInBase(averageEntry.usdValue || 0)

      if (quantity.isZero() || usdValue.isZero()) {
        continue
      }

      totalQuantity = totalQuantity.plus(quantity)
      totalCostBasis = totalCostBasis.plus(usdValue)
    }

    if (totalCostBasis.isZero() || totalQuantity.isZero()) {
      return
    }

    const averageEntryPrice = totalCostBasis.dividedBy(totalQuantity)
    const currentValue = totalQuantity.multipliedBy(currentTokenUsdPrice)

    const pnl = currentValue.minus(totalCostBasis)
    const roiPercentage = pnl.dividedBy(totalCostBasis).multipliedBy(100)

    return {
      pnl,
      roiPercentage,
      averageEntryPrice
    }
  })
}

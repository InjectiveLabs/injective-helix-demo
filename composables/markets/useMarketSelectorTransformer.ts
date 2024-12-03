import { SharedMarketChange } from '@shared/types'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { PerpetualMarket } from '@injectivelabs/sdk-ts'
import { formatFundingRate } from '@shared/transformer/market/fundingRate'
import { rwaMarketIds } from '@/app/data/market'
import {
  UiDerivativeMarket,
  MarketsSelectorTableColumn,
  UiMarketAndSummaryWithVolumeInUsd
} from '@/types'

export function useMarketSelectorTransformer(
  marketList: ComputedRef<UiMarketAndSummaryWithVolumeInUsd[]>,
  marketPriceMap: ComputedRef<Record<string, BigNumberInBase>>
) {
  const derivativeStore = useDerivativeStore()

  const priceChangeClassesMap: Partial<Record<SharedMarketChange, string>> = {
    [SharedMarketChange.Decrease]: 'text-red-500',
    [SharedMarketChange.Increase]: 'text-green-500',
    [SharedMarketChange.NoChange]: 'text-coolGray-350'
  }

  const rows = computed(() => {
    return marketList.value.map((item) => {
      const perpetualMarket = item.market as PerpetualMarket
      const uiDerivativeMarket = item.market as UiDerivativeMarket

      const priceChangeClassKey =
        item?.summary?.lastPriceChange || SharedMarketChange.NoChange

      const lastTradedPrice =
        marketPriceMap.value[item.market.marketId]?.toFixed() ||
        item.summary.lastPrice ||
        0

      const fundingRate = formatFundingRate({
        info: perpetualMarket.perpetualMarketInfo,
        funding: perpetualMarket.perpetualMarketFunding
      })

      const openInterest = new BigNumberInBase(
        derivativeStore.tickerOpenInterestMap[item.market.ticker] || 0
      )

      const leverage = uiDerivativeMarket.initialMarginRatio
        ? new BigNumberInBase(1).dividedBy(
            uiDerivativeMarket.initialMarginRatio
          )
        : ZERO_IN_BASE

      return {
        leverage,
        market: item.market,
        volumeInUsd: item.volumeInUsd,
        volumeInUsdToFixed: item.volumeInUsd.toFixed(
          0,
          BigNumberInBase.ROUND_DOWN
        ),
        isRWAMarket: rwaMarketIds.includes(item.market.marketId),
        leverageToFixed: leverage.toFixed(0, BigNumberInBase.ROUND_DOWN),
        priceChangeClasses: priceChangeClassesMap[priceChangeClassKey] || '',
        [MarketsSelectorTableColumn.MarketVolume24h]:
          item.volumeInUsd.toNumber(),
        [MarketsSelectorTableColumn.Markets]:
          item.market?.ticker?.toUpperCase() || '',
        [MarketsSelectorTableColumn.LastPrice]: lastTradedPrice,
        [MarketsSelectorTableColumn.FundingRate]: fundingRate,
        [MarketsSelectorTableColumn.OpenInterest]: openInterest,
        [MarketsSelectorTableColumn.MarketChange24h]: item.summary?.change || 0
      }
    })
  })

  return { rows }
}

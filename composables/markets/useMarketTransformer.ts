import { SharedMarketChange } from '@shared/types'
import { rwaMarketIds } from '@/app/data/market'
import { MarketsTableColumn, UiMarketAndSummaryWithVolumeInUsd } from '@/types'

export function useMarketTransformer(
  marketList: ComputedRef<UiMarketAndSummaryWithVolumeInUsd[]>
) {
  const priceChangeClassesMap: Partial<Record<SharedMarketChange, string>> = {
    [SharedMarketChange.Decrease]: 'text-red-500',
    [SharedMarketChange.Increase]: 'text-green-500',
    [SharedMarketChange.NoChange]: 'text-coolGray-350'
  }

  const rows = computed(() => {
    return marketList.value.map((item) => {
      const priceChangeClassKey =
        item?.summary?.lastPriceChange || SharedMarketChange.NoChange

      return {
        market: item.market,
        summary: item.summary,
        volumeInUsd: item.volumeInUsd,
        isVerified: item.market.isVerified,
        priceChangeClasses: priceChangeClassesMap[priceChangeClassKey] || '',
        isRwaMarket: rwaMarketIds.includes(item.market.marketId),
        [MarketsTableColumn.LastPrice]: item.summary?.lastPrice || 0,
        [MarketsTableColumn.MarketChange24h]: item.summary?.change || 0,
        [MarketsTableColumn.MarketVolume24h]: item.volumeInUsd.toNumber(),
        [MarketsTableColumn.Markets]: item.market?.ticker?.toUpperCase() || ''
      }
    })
  })

  return { rows }
}

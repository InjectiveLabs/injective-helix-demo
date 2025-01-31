import { SharedMarketChange } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { rwaMarketIds } from '@/app/data/market'
import { MarketsTableColumn, UiMarketAndSummaryWithVolumeInUsd } from '@/types'
import { INDEX_MARKETS_INFO } from '~/app/utils/constants'

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

      const change = item.summary?.change || 0

      const changePrefix = new BigNumberInBase(change).gt(0) ? '+' : ''

      const formattedChange = changePrefix + change

      const indexMarketInfo = INDEX_MARKETS_INFO.find(
        (market) => market.marketId === item.market.marketId
      )

      return {
        indexMarketInfo,
        formattedChange,
        market: item.market,
        summary: item.summary,
        volumeInUsd: item.volumeInUsd,
        isVerified: item.market.isVerified,
        isRwaMarket: rwaMarketIds.includes(item.market.marketId),
        priceChangeClasses: priceChangeClassesMap[priceChangeClassKey] || '',
        [MarketsTableColumn.MarketChange24h]: change,
        [MarketsTableColumn.LastPrice]: item.summary?.lastPrice || 0,
        [MarketsTableColumn.MarketVolume24h]: item.volumeInUsd.toNumber(),
        [MarketsTableColumn.Markets]: item.market?.ticker?.toUpperCase() || ''
      }
    })
  })

  return { rows }
}

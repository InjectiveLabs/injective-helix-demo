import { SharedMarketChange } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  INDEX_MARKETS_INFO,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { MarketsTableColumn, UiMarketAndSummaryWithVolumeInUsd } from '@/types'

export function useMarketTransformer(
  marketList: ComputedRef<UiMarketAndSummaryWithVolumeInUsd[]>
) {
  const jsonStore = useSharedJsonStore()

  const priceChangeClassesMap: Partial<Record<SharedMarketChange, string>> = {
    [SharedMarketChange.Decrease]: 'text-red-500',
    [SharedMarketChange.Increase]: 'text-green-500',
    [SharedMarketChange.NoChange]: 'text-coolGray-350'
  }

  const rows = computed(() => {
    return marketList.value.map((item) => {
      const priceChangeClassKey =
        item?.summary?.lastPriceChange || SharedMarketChange.NoChange

      const changeInBigNumber = new BigNumberInBase(item.summary?.change || 0)

      const changePrefix = changeInBigNumber.gt(0) ? '+' : ''

      const formattedChange =
        changePrefix +
        changeInBigNumber.toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS)

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
        isRwaMarket: jsonStore.isTradeFiMarket(item.market.marketId),
        priceChangeClasses: priceChangeClassesMap[priceChangeClassKey] || '',
        [MarketsTableColumn.MarketChange24h]: changeInBigNumber.toNumber(),
        [MarketsTableColumn.LastPrice]: item.summary?.lastPrice || 0,
        [MarketsTableColumn.MarketVolume24h]: item.volumeInUsd.toNumber(),
        [MarketsTableColumn.Markets]: item.market?.ticker?.toUpperCase() || ''
      }
    })
  })

  return { rows }
}

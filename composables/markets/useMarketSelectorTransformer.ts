import { SharedMarketChange } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { PerpetualMarket } from '@injectivelabs/sdk-ts'
import { formatFundingRate } from '@shared/transformer/market/fundingRate'
import { rwaMarketIds } from '@/app/data/market'
import { calculateLeverage } from '@/app/utils/formatters'
import {
  UiDerivativeMarket,
  MarketsSelectorTableColumn,
  UiMarketAndSummaryWithVolumeInUsd
} from '@/types'

export function useMarketSelectorTransformer(
  marketList: ComputedRef<UiMarketAndSummaryWithVolumeInUsd[]>,
  marketPriceMap: ComputedRef<Record<string, BigNumberInBase>>
) {
  // const derivativeStore = useDerivativeStore()

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

      // const openInterest = new BigNumberInBase(
      //   derivativeStore.tickerOpenInterestMap[item.market.ticker] || 0
      // )

      const leverage = calculateLeverage(uiDerivativeMarket.initialMarginRatio)

      const change = item.summary?.change || 0

      const changePrefix = new BigNumberInBase(change).gt(0) ? '+' : ''

      const formattedChange = changePrefix + change

      return {
        leverage,
        formattedChange,
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
        [MarketsSelectorTableColumn.MarketChange24h]: change,
        [MarketsSelectorTableColumn.FundingRate]: fundingRate,
        [MarketsSelectorTableColumn.LastPrice]: lastTradedPrice
        // [MarketsSelectorTableColumn.OpenInterest]: openInterest
      }
    })
  })

  return { rows }
}

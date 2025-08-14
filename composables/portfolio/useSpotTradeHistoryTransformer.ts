import { format } from 'date-fns'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import { DATE_TIME_DISPLAY } from '@/app/utils/constants'
import {
  TradeExecutionType,
  PortfolioSpotTradeHistoryTableColumn
} from '@/types'
import type { SharedUiSpotTrade } from '@shared/types'
import type { TransformedPortfolioSpotTradeHistory } from '@/types'

export function useSpotTradeHistoryTransformer(
  tradeList: ComputedRef<SharedUiSpotTrade[]>
) {
  const spotStore = useSpotStore()
  const { t } = useLang()

  const tradeExecutionMap = {
    [TradeExecutionType.Market]: t('trade.market'),
    [TradeExecutionType.LimitFill]: t('trade.limit'),
    [TradeExecutionType.LimitMatchNewOrder]: t('trade.limit'),
    [TradeExecutionType.LimitMatchRestingOrder]: t('trade.limit')
  }

  const rows = computed(() =>
    tradeList.value.reduce((list, trade) => {
      const market = spotStore.marketByIdOrSlug(trade.marketId)

      if (!market) {
        return list
      }

      const quantity = !trade.quantity
        ? ZERO_IN_BASE
        : sharedToBalanceInTokenInBase({
            value: trade.quantity,
            decimalPlaces: market.baseToken.decimals
          })

      const tradeExecutionType =
        tradeExecutionMap[trade.tradeExecutionType] || t('trade.limit')

      const time = !trade.executedAt
        ? ''
        : format(trade.executedAt, DATE_TIME_DISPLAY)

      const price = !trade.price
        ? ZERO_IN_BASE
        : new BigNumberInBase(
            new BigNumberInBase(trade.price).toWei(
              market.baseToken.decimals - market.quoteToken.decimals
            )
          )

      const total = quantity.times(price)

      const fee = !trade.fee
        ? ZERO_IN_BASE
        : sharedToBalanceInTokenInBase({
            value: trade.fee,
            decimalPlaces: market.quoteToken.decimals
          })

      list.push({
        trade,
        market,
        quantity,
        tradeExecutionType,
        priceDecimals: market.priceDecimals,
        quantityDecimals: market.quantityDecimals,
        [PortfolioSpotTradeHistoryTableColumn.Fee]: fee,
        [PortfolioSpotTradeHistoryTableColumn.Time]: time,
        [PortfolioSpotTradeHistoryTableColumn.Price]: price,
        [PortfolioSpotTradeHistoryTableColumn.Total]: total
      })

      return list
    }, [] as TransformedPortfolioSpotTradeHistory[])
  )

  return { rows }
}

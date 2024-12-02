import { format } from 'date-fns'
import { SharedUiSpotTrade } from '@shared/types'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import { DATE_TIME_DISPLAY } from '@/app/utils/constants'
import {
  TradeExecutionType,
  PortfolioSpotTradeHistoryTableColumn,
  TransformedPortfolioSpotTradeHistory
} from '@/types'

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
      const market = spotStore.markets.find(
        (market) => market.marketId === trade.marketId
      )

      if (!market) {
        return list
      }

      const quantity = !trade.quantity
        ? ZERO_IN_BASE
        : new BigNumberInWei(trade.quantity).toBase(market.baseToken.decimals)

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
        : new BigNumberInWei(trade.fee).toBase(market.quoteToken.decimals)

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

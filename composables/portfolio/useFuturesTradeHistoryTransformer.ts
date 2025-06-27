import { format } from 'date-fns'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import { DATE_TIME_DISPLAY } from '@/app/utils/constants'
import {
  TradeExecutionType,
  PortfolioFuturesTradeHistoryTableColumn
} from '@/types'
import type { TransformedPortfolioFuturesTradeHistory } from '@/types'
import type { SharedUiSpotTrade, SharedUiDerivativeTrade } from '@shared/types'

export function useFuturesTradeHistoryTransformer(
  tradeList: ComputedRef<SharedUiDerivativeTrade[]>
) {
  const { t } = useLang()
  const derivativeStore = useDerivativeStore()

  const tradeExecutionMap = {
    [TradeExecutionType.Market]: t('trade.market'),
    [TradeExecutionType.LimitFill]: t('trade.limit'),
    [TradeExecutionType.LimitMatchNewOrder]: t('trade.limit'),
    [TradeExecutionType.LimitMatchRestingOrder]: t('trade.limit')
  }

  const rows = computed(() =>
    tradeList.value.reduce((list, trade) => {
      const market = derivativeStore.marketByIdOrSlug(trade.marketId)

      if (!market) {
        return list
      }

      /** Unifying both spot and derivative to spot trade type */
      const derivativeTrade = trade as SharedUiDerivativeTrade

      const tradeToSpotTrade = {
        ...derivativeTrade,
        price: derivativeTrade.executionPrice,
        quantity: derivativeTrade.executionQuantity,
        timestamp: derivativeTrade.executedAt
      } as SharedUiSpotTrade

      const quantity = !tradeToSpotTrade.quantity
        ? ZERO_IN_BASE
        : new BigNumberInBase(tradeToSpotTrade.quantity)

      const pnl = !trade.pnl
        ? ZERO_IN_BASE
        : sharedToBalanceInTokenInBase({
            value: trade.pnl,
            decimalPlaces: market.quoteToken.decimals
          })

      const tradeExecutionType = derivativeTrade.isLiquidation
        ? t('trade.liquidation')
        : tradeExecutionMap[trade.tradeExecutionType] || t('trade.limit')

      const fee = !trade.fee
        ? ZERO_IN_BASE
        : sharedToBalanceInTokenInBase({
            value: trade.fee,
            decimalPlaces: market.quoteToken.decimals
          })

      const time = !trade.executedAt
        ? ''
        : format(trade.executedAt, DATE_TIME_DISPLAY)

      const price = !tradeToSpotTrade.price
        ? ZERO_IN_BASE
        : sharedToBalanceInTokenInBase({
            value: tradeToSpotTrade.price,
            decimalPlaces: market.quoteToken.decimals
          })

      const total = quantity.times(price)

      list.push({
        trade,
        market,
        quantity,
        tradeExecutionType,
        priceDecimals: market.priceDecimals,
        quantityDecimals: market.quantityDecimals,
        [PortfolioFuturesTradeHistoryTableColumn.Pnl]: pnl,
        [PortfolioFuturesTradeHistoryTableColumn.Fee]: fee,
        [PortfolioFuturesTradeHistoryTableColumn.Time]: time,
        [PortfolioFuturesTradeHistoryTableColumn.Total]: total,
        [PortfolioFuturesTradeHistoryTableColumn.Price]: price
      })

      return list
    }, [] as TransformedPortfolioFuturesTradeHistory[])
  )

  return { rows }
}

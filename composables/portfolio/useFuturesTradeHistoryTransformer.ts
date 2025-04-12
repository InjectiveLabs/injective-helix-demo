import { format } from 'date-fns'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import { SharedUiSpotTrade, SharedUiDerivativeTrade } from '@shared/types'
import { DATE_TIME_DISPLAY } from '@/app/utils/constants'
import {
  TradeExecutionType,
  PortfolioFuturesTradeHistoryTableColumn,
  TransformedPortfolioFuturesTradeHistory
} from '@/types'

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
      const market = derivativeStore.markets.find(
        (market) => market.marketId === trade.marketId
      )

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

      const tradeExecutionType = derivativeTrade.isLiquidation
        ? t('trade.liquidation')
        : tradeExecutionMap[trade.tradeExecutionType] || t('trade.limit')

      const fee = !trade.fee
        ? ZERO_IN_BASE
        : new BigNumberInWei(trade.fee).toBase(market.quoteToken.decimals)

      const time = !trade.executedAt
        ? ''
        : format(trade.executedAt, DATE_TIME_DISPLAY)

      const price = !tradeToSpotTrade.price
        ? ZERO_IN_BASE
        : new BigNumberInWei(tradeToSpotTrade.price).toBase(
            market.quoteToken.decimals
          )

      const total = quantity.times(price)

      list.push({
        trade,
        market,
        quantity,
        tradeExecutionType,
        priceDecimals: market.priceDecimals,
        quantityDecimals: market.quantityDecimals,
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

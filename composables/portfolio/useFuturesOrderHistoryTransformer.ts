import {
  OrderSide,
  OrderState,
  TradeExecutionType
} from '@injectivelabs/ts-types'
import { format } from 'date-fns'
import { DerivativeOrderHistory } from '@injectivelabs/sdk-ts'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import { DATE_TIME_DISPLAY } from '@/app/utils/constants'
import {
  PortfolioFuturesOrderHistoryTableColumn,
  TransformedPortfolioFuturesOrderHistory
} from '@/types'

export function useFuturesOrderHistoryTransformer(
  orderList: ComputedRef<DerivativeOrderHistory[]>
) {
  const { t } = useLang()
  const derivativeStore = useDerivativeStore()

  const orderStatusMap: Partial<Record<OrderState, string>> = {
    [OrderState.Booked]: t('trade.open'),
    [OrderState.Filled]: t('trade.filled'),
    [OrderState.Canceled]: t('trade.cancelled'),
    [OrderState.Triggered]: t('trade.triggered'),
    [OrderState.PartialFilled]: t('trade.partialFilled'),
    [OrderState.PartiallyFilled]: t('trade.partiallyFilled')
  }

  const rows = computed(() =>
    orderList.value.reduce((list, order) => {
      const market = derivativeStore.markets.find(
        (market) => market.marketId === order.marketId
      )

      if (!market) {
        return list
      }

      const orderSideList = [
        OrderSide.Buy,
        OrderSide.BuyPO,
        OrderSide.TakeBuy,
        OrderSide.StopBuy
      ]
      const isBuy =
        order.direction === OrderSide.Buy ||
        orderSideList.includes(order.orderType as OrderSide)

      const quantity = new BigNumberInBase(order.quantity)

      const triggerPrice = new BigNumberInWei(
        (order as DerivativeOrderHistory).triggerPrice
      ).toBase(market.quoteToken.decimals)

      const margin = new BigNumberInWei(
        (order as DerivativeOrderHistory).margin
      ).toBase(market.quoteToken.decimals)

      const isReduceOnly =
        (order as DerivativeOrderHistory).isReduceOnly || margin.isZero()

      const derivativeOrder = order as DerivativeOrderHistory

      const isStopLoss =
        derivativeOrder.orderType === OrderSide.StopBuy ||
        derivativeOrder.orderType === OrderSide.StopSell

      const isTakeProfit =
        derivativeOrder.orderType === OrderSide.TakeBuy ||
        derivativeOrder.orderType === OrderSide.TakeSell

      const executionType =
        order.executionType === TradeExecutionType.Market
          ? t('trade.market')
          : t('trade.limit')

      const typeMap: Partial<Record<OrderSide, string>> = {
        [OrderSide.Buy]: executionType,
        [OrderSide.Sell]: executionType,
        [OrderSide.BuyPO]: executionType,
        [OrderSide.SellPO]: executionType,
        [OrderSide.StopBuy]: `${t('trade.stopLoss')} ${executionType}`,
        [OrderSide.StopSell]: `${t('trade.stopLoss')} ${executionType}`,
        [OrderSide.TakeBuy]: `${t('trade.takeProfit')} ${executionType}`,
        [OrderSide.TakeSell]: `${t('trade.takeProfit')} ${executionType}`
      }

      const type = typeMap[order.orderType as OrderSide] || ''

      const price = new BigNumberInWei(order.price).toBase(
        market.quoteToken.decimals
      )

      const total = price.multipliedBy(quantity)

      list.push({
        order,
        isBuy,
        quantity,
        isStopLoss,
        triggerPrice,
        isReduceOnly,
        isTakeProfit,
        priceDecimals: market.priceDecimals,
        quantityDecimals: market.quantityDecimals,
        timestamp: format(order.updatedAt, DATE_TIME_DISPLAY),
        orderStatus: orderStatusMap[order.state as OrderState] || '',
        isMarketOrder: order.executionType === TradeExecutionType.Market,
        [PortfolioFuturesOrderHistoryTableColumn.Type]: type,
        [PortfolioFuturesOrderHistoryTableColumn.Total]: total,
        [PortfolioFuturesOrderHistoryTableColumn.Price]: price,
        [PortfolioFuturesOrderHistoryTableColumn.Market]: market
      })

      return list
    }, [] as TransformedPortfolioFuturesOrderHistory[])
  )

  return { rows }
}

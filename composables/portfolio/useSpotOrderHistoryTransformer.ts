import {
  OrderSide,
  OrderState,
  TradeExecutionType
} from '@injectivelabs/ts-types'
import { format } from 'date-fns'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { SpotOrderHistory } from '@injectivelabs/sdk-ts'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import { DATE_TIME_DISPLAY } from '@/app/utils/constants'
import {
  UiSpotMarket,
  PortfolioSpotOrderHistoryTableColumn,
  TransformedPortfolioSpotOrderHistory
} from '@/types'

export function useSpotOrderHistoryTransformer(
  orderList: ComputedRef<SpotOrderHistory[]>
) {
  const { t } = useLang()
  const spotStore = useSpotStore()

  const orderStatusMap: Partial<Record<OrderState, string>> = {
    [OrderState.Booked]: t('trade.open'),
    [OrderState.Filled]: t('trade.filled'),
    [OrderState.Canceled]: t('trade.cancelled'),
    [OrderState.Triggered]: t('trade.triggered'),
    [OrderState.PartialFilled]: t('trade.partialFilled'),
    [OrderState.PartiallyFilled]: t('trade.partiallyFilled')
  }

  const orderSideList = [
    OrderSide.Buy,
    OrderSide.BuyPO,
    OrderSide.TakeBuy,
    OrderSide.StopBuy
  ]

  const rows = computed(() =>
    orderList.value.reduce((list, order) => {
      const market = spotStore.markets.find(
        (market) => market.marketId === order.marketId
      )

      if (!market) {
        return list
      }

      const isBuy =
        order.direction === OrderSide.Buy ||
        orderSideList.includes(order.orderType as OrderSide)

      const quantity = new BigNumberInWei(order.quantity).toBase(
        (market as UiSpotMarket).baseToken.decimals
      )

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

      const price = market.baseToken
        ? new BigNumberInBase(
            new BigNumberInBase(order.price).toWei(
              market.baseToken.decimals - market.quoteToken.decimals
            )
          )
        : new BigNumberInWei(order.price).toBase(market.quoteToken.decimals)

      const total = price.multipliedBy(quantity)

      list.push({
        order,
        isBuy,
        quantity,
        triggerPrice: ZERO_IN_BASE,
        priceDecimals: market.priceDecimals,
        quantityDecimals: market.quantityDecimals,
        timestamp: format(order.updatedAt, DATE_TIME_DISPLAY),
        orderStatus: orderStatusMap[order.state as OrderState] || '',
        [PortfolioSpotOrderHistoryTableColumn.Type]: type,
        [PortfolioSpotOrderHistoryTableColumn.Total]: total,
        [PortfolioSpotOrderHistoryTableColumn.Price]: price,
        [PortfolioSpotOrderHistoryTableColumn.Market]: market
      })

      return list
    }, [] as TransformedPortfolioSpotOrderHistory[])
  )

  return { rows }
}

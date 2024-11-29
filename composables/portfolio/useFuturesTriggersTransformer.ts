import {
  MsgType,
  OrderSide,
  OrderState,
  TradeExecutionType
} from '@injectivelabs/ts-types'
import { DerivativeOrderHistory } from '@injectivelabs/sdk-ts'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import {
  PortfolioFuturesTriggersTableColumn,
  TransformedPortfolioFuturesTriggers
} from '@/types'

export function useFuturesTriggersTransformer(
  triggerList: ComputedRef<DerivativeOrderHistory[]>
) {
  const { t } = useLang()
  const authZStore = useAuthZStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  const orderSideList = [
    OrderSide.Buy,
    OrderSide.BuyPO,
    OrderSide.TakeBuy,
    OrderSide.StopBuy
  ]

  const rows = computed(() =>
    triggerList.value.reduce((list, trigger) => {
      const market = derivativeStore.markets.find(
        (market) => market.marketId === trigger.marketId
      )

      if (!market) {
        return list
      }

      const executionType =
        trigger.executionType === TradeExecutionType.Market
          ? t('trade.market')
          : t('trade.limit')

      const typeMap: Partial<Record<OrderSide, string>> = {
        [OrderSide.BuyPO]: executionType,
        [OrderSide.SellPO]: executionType,
        [OrderSide.StopBuy]: `${t('trade.stopLoss')} ${executionType}`,
        [OrderSide.StopSell]: `${t('trade.stopLoss')} ${executionType}`,
        [OrderSide.TakeBuy]: `${t('trade.takeProfit')} ${executionType}`,
        [OrderSide.TakeSell]: `${t('trade.takeProfit')} ${executionType}`
      }

      const type = typeMap[trigger.orderType as OrderSide] || ''

      const price = new BigNumberInWei(trigger.price).toBase(
        market.quoteToken.decimals
      )

      const margin = new BigNumberInWei(trigger.margin).toBase(
        market.quoteToken.decimals
      )

      const isReduceOnly = trigger.isReduceOnly || margin.isZero()

      const quantity = new BigNumberInBase(trigger.quantity)

      const total = price.multipliedBy(quantity)

      const leverage = isReduceOnly
        ? new BigNumberInBase('')
        : new BigNumberInBase(price.times(quantity).dividedBy(margin))

      const isBuy =
        trigger.direction === OrderSide.Buy ||
        orderSideList.includes(trigger.orderType as OrderSide)

      const isStopLoss =
        trigger.orderType === OrderSide.StopBuy ||
        trigger.orderType === OrderSide.StopSell

      const triggerPrice = new BigNumberInWei(trigger.triggerPrice).toBase(
        market.quoteToken.decimals
      )

      const isTakeProfit =
        trigger.orderType === OrderSide.TakeBuy ||
        trigger.orderType === OrderSide.TakeSell

      const isMarketOrder =
        trigger.executionType === PortfolioFuturesTriggersTableColumn.Market

      const isAuthorized =
        !sharedWalletStore.isAuthzWalletConnected ||
        authZStore.hasAuthZPermission(MsgType.MsgCancelDerivativeOrder)

      list.push({
        isBuy,
        trigger,
        quantity,
        isStopLoss,
        isReduceOnly,
        triggerPrice,
        isTakeProfit,
        isAuthorized,
        isMarketOrder,
        priceDecimals: market.priceDecimals,
        quantityDecimals: market.quantityDecimals,
        isCancelable: trigger.state === OrderState.Booked,
        [PortfolioFuturesTriggersTableColumn.Type]: type,
        [PortfolioFuturesTriggersTableColumn.Total]: total,
        [PortfolioFuturesTriggersTableColumn.Price]: price,
        [PortfolioFuturesTriggersTableColumn.Market]: market,
        [PortfolioFuturesTriggersTableColumn.Leverage]: leverage
      })

      return list
    }, [] as TransformedPortfolioFuturesTriggers[])
  )

  return { rows }
}

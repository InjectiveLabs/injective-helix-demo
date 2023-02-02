import { TradeExecutionType } from '@injectivelabs/ts-types'
import { ConditionalOrderSide, ConditionalOrderType, TradeTypes } from '@/types'

export const executionOrderTypeToOrderExecutionTypes = (
  executionOrderType?: string
): TradeTypes[] | undefined => {
  if (!executionOrderType) {
    return undefined
  }

  const [type] = executionOrderType.split('-')

  if (type === TradeExecutionType.Market) {
    return [TradeTypes.Market]
  }

  if (type === TradeExecutionType.LimitFill) {
    return [TradeTypes.Limit]
  }

  return undefined
}

export const executionOrderTypeToTradeExecutionTypes = (
  executionOrderType?: string
): TradeExecutionType[] | undefined => {
  if (!executionOrderType) {
    return undefined
  }

  const [type] = executionOrderType.split('-')

  if (type === TradeExecutionType.Market) {
    return [TradeExecutionType.Market]
  }

  if (type === TradeExecutionType.LimitFill) {
    return [
      TradeExecutionType.LimitFill,
      TradeExecutionType.LimitMatchRestingOrder,
      TradeExecutionType.LimitMatchNewOrder
    ]
  }

  return undefined
}

export const executionOrderTypeToOrderTypes = (executionOrderType?: string) => {
  if (!executionOrderType) {
    return undefined
  }

  const [, orderType] = executionOrderType.split('-')

  if (!orderType) {
    return [ConditionalOrderSide.Buy, ConditionalOrderSide.Sell]
  }

  if (orderType === ConditionalOrderType.TakeProfit) {
    return [ConditionalOrderSide.TakeBuy, ConditionalOrderSide.TakeSell]
  }

  if (orderType === ConditionalOrderType.StopLoss) {
    return [ConditionalOrderSide.StopBuy, ConditionalOrderSide.StopSell]
  }
}

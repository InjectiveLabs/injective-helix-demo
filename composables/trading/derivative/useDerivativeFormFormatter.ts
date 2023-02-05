import { type Ref } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { TradeExecutionType, TradeField, TradeForm } from '@/types'

export function useDerivativeFormFormatter(tradeForm: Ref<TradeForm>) {
  const baseAmount = computed(() =>
    tradeForm.value[TradeField.BaseAmount]
      ? new BigNumberInBase(tradeForm.value[TradeField.BaseAmount])
      : ZERO_IN_BASE
  )

  const hasBaseAmount = computed(() => baseAmount.value.gt('0'))

  const limitPrice = computed(
    () => new BigNumberInBase(tradeForm.value[TradeField.LimitPrice] || 0)
  )

  const quoteAmount = computed(() =>
    tradeForm.value[TradeField.QuoteAmount]
      ? new BigNumberInBase(tradeForm.value[TradeField.QuoteAmount])
      : ZERO_IN_BASE
  )

  const triggerPrice = computed(() => {
    if (tradeForm.value[TradeField.TriggerPrice] === '') {
      return undefined
    }

    return new BigNumberInBase(tradeForm.value[TradeField.TriggerPrice] || 0)
  })

  const hasTriggerPrice = computed(() => triggerPrice.value !== undefined)

  const tradingTypeMarket = computed(
    () => tradeForm.value[TradeField.TradingType] === TradeExecutionType.Market
  )

  const tradingTypeLimit = computed(
    () =>
      tradeForm.value[TradeField.TradingType] === TradeExecutionType.LimitFill
  )

  const tradingTypeStopLimit = computed(
    () =>
      tradeForm.value[TradeField.TradingType] === TradeExecutionType.StopLimit
  )

  const tradingTypeStopMarket = computed(
    () =>
      tradeForm.value[TradeField.TradingType] === TradeExecutionType.StopMarket
  )

  const isConditionalOrder = computed(() => {
    return tradingTypeStopMarket.value || tradingTypeStopLimit.value
  })

  return {
    limitPrice,
    baseAmount,
    quoteAmount,
    triggerPrice,
    hasBaseAmount,
    hasTriggerPrice,
    tradingTypeLimit,
    tradingTypeMarket,
    isConditionalOrder,
    tradingTypeStopLimit,
    tradingTypeStopMarket
  }
}

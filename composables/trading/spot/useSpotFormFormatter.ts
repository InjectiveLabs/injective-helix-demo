import { type Ref } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { TradeExecutionType, TradeField, TradeForm } from '@/types'

export function useSpotFormFormatter(tradeForm: Ref<TradeForm>) {
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

  const tradingTypeMarket = computed(
    () => tradeForm.value[TradeField.TradingType] === TradeExecutionType.Market
  )

  const tradingTypeLimit = computed(
    () =>
      tradeForm.value[TradeField.TradingType] === TradeExecutionType.LimitFill
  )

  return {
    limitPrice,
    baseAmount,
    quoteAmount,
    hasBaseAmount,
    tradingTypeLimit,
    tradingTypeMarket
  }
}

import { OrderSide } from '@injectivelabs/ts-types'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { TradeTypes, TradeAmountOption, SpotTradeFormField } from '@/types'
import type { UiSpotMarket, SpotTradeForm } from '@/types'

export function useSpotEstimatedSlippage(
  market: Ref<undefined | UiSpotMarket>
) {
  const orderbookStore = useOrderbookStore()
  const spotFormValues = useFormValues<SpotTradeForm>()

  const isBuy = computed(
    () => spotFormValues.value[SpotTradeFormField.Side] === OrderSide.Buy
  )

  const isLimitOrder = computed(
    () => spotFormValues.value[SpotTradeFormField.Type] === TradeTypes.Limit
  )

  const isBaseOrder = computed(
    () =>
      spotFormValues.value[SpotTradeFormField.AmountOption] ===
      TradeAmountOption.Base
  )

  const quantity = computed(() => {
    const tradeAmount = new BigNumberInBase(
      spotFormValues.value[SpotTradeFormField.Amount] || 0
    )

    if (isBaseOrder.value) {
      return tradeAmount
    }

    if (isLimitOrder.value) {
      const price = new BigNumberInBase(
        spotFormValues.value[SpotTradeFormField.Price] || 0
      )

      return price.isZero() ? ZERO_IN_BASE : tradeAmount.div(price)
    }

    const records = isBuy.value ? orderbookStore.sells : orderbookStore.buys
    if (!records?.length) {
      return ZERO_IN_BASE
    }

    const bestPrice = new BigNumberInBase(records[0].price)

    return bestPrice.isZero() ? ZERO_IN_BASE : tradeAmount.div(bestPrice)
  })

  const estimatedSlippage = computed((): undefined | BigNumberInBase => {
    if (isLimitOrder.value || !market.value || quantity.value.isZero()) {
      return
    }

    const records = isBuy.value ? orderbookStore.sells : orderbookStore.buys
    if (!records?.length) {
      return
    }

    const bestPrice = new BigNumberInBase(records[0].price)
    if (bestPrice.isZero()) {
      return
    }

    let totalCost = ZERO_IN_BASE
    let totalFilled = ZERO_IN_BASE
    const orderSize = quantity.value

    for (const record of records) {
      if (totalFilled.gte(orderSize)) break

      const askSize = new BigNumberInBase(record.quantity)
      const askPrice = new BigNumberInBase(record.price)

      const fillAmount = BigNumberInBase.min(
        askSize,
        orderSize.minus(totalFilled)
      )

      totalCost = totalCost.plus(fillAmount.times(askPrice))
      totalFilled = totalFilled.plus(fillAmount)
    }

    // don't use 100% to avoid rounding errors stopping the computation
    if (totalFilled.isZero() || totalFilled.lt(orderSize.times(0.99))) {
      return
    }

    const vwap = totalCost.div(totalFilled)

    let slippage: BigNumberInBase
    if (isBuy.value) {
      slippage = new BigNumberInBase(vwap.minus(bestPrice).div(bestPrice))
    } else {
      slippage = new BigNumberInBase(bestPrice.minus(vwap).div(bestPrice))
    }

    return new BigNumberInBase(slippage.times(100).abs())
  })

  return {
    estimatedSlippage
  }
}

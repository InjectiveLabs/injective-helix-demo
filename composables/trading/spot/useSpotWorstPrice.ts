import { OrderSide } from '@injectivelabs/ts-types'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  SpotTradeForm,
  SpotTradeFormField,
  TradeTypes,
  spotMarketKey
} from '@/types'
import { calculateWorstPrice, quantizeNumber } from '~/app/utils/helpers'

export function useSpotWorstPrice() {
  const spotFormValues = useFormValues<SpotTradeForm>()
  const orderbookStore = useOrderbookStore()

  const isBuy = computed(
    () => spotFormValues.value[SpotTradeFormField.Side] === OrderSide.Buy
  )

  const isLimitOrder = computed(
    () => spotFormValues.value[SpotTradeFormField.Type] === TradeTypes.Limit
  )

  const market = inject(spotMarketKey)

  // const worstPriceAndLiquidity = computed(() => {
  //   let quantity = Number(
  //     spotFormValues.value[SpotTradeFormField.Quantity] || '0'
  //   )

  //   const records = isBuy.value ? orderbookStore.sells : orderbookStore.buys

  //   if (!records.length || quantity <= 0) {
  //     return {
  //       hasEnoughLiquidity: true,
  //       worstPrice: '0'
  //     }
  //   }

  //   let worstPrice

  //   for (const record of records) {
  //     // if (isBuy.value) {
  //     quantity -= Number(record.quantity)
  //     worstPrice = record.price
  //     if (quantity < 0) {
  //       break
  //     }
  //   }

  //   return {
  //     hasEnoughLiquidity: quantity <= 0,
  //     worstPrice: worstPrice || '0'
  //   }
  // })

  const worstPriceAndLiquidity = computed(() => {
    const records = isBuy.value ? orderbookStore.sells : orderbookStore.buys

    if (isLimitOrder.value) {
      const price = new BigNumberInBase(
        spotFormValues.value[SpotTradeFormField.Price] || '0'
      )
      const totalPrice = price.times(
        spotFormValues.value[SpotTradeFormField.Quantity] || '0'
      )

      return { totalPrice, worstPrice: price, hasEnoughLiquidity: true }
    }

    return calculateWorstPrice(
      spotFormValues.value[SpotTradeFormField.Quantity] || '0',
      records
    )
  })

  const totalWorstPrice = computed(
    () =>
      new BigNumberInBase(
        new BigNumberInBase(worstPriceAndLiquidity.value.totalPrice).dp(
          market?.value?.priceDecimals || 0
        )
      )
  )

  const worstPrice = computed(
    () => new BigNumberInBase(worstPriceAndLiquidity.value.worstPrice)
  )

  const hasEnoughLiquidity = computed(
    () => worstPriceAndLiquidity.value.hasEnoughLiquidity
  )

  const worstPriceWithSlippage = computed(() => {
    const slippage = Number(
      spotFormValues.value[SpotTradeFormField.Slippage] || 0
    )

    const percentage = isBuy.value ? 1 + slippage / 100 : 1 - slippage / 100

    return new BigNumberInBase(
      quantizeNumber(
        Number(worstPrice.value) * percentage,
        market?.value?.priceTensMultiplier || 0
      )
    )
  })

  const totalWorstPriceWithSlippage = computed(() => {
    const slippage = Number(
      spotFormValues.value[SpotTradeFormField.Slippage] || 0
    )

    const percentage = isBuy.value ? 1 + slippage / 100 : 1 - slippage / 100

    return new BigNumberInBase(
      quantizeNumber(
        Number(totalWorstPrice.value) * percentage,
        market?.value?.priceTensMultiplier || 0
      )
    )
  })

  const totalWorstPriceWithSlippageAndFees = computed(() => {
    const price = totalWorstPriceWithSlippage.value

    const takerFee = Number(market?.value?.takerFeeRate || 0)

    const percentage = isBuy.value ? 1 + takerFee : 1 - takerFee

    return quantizeNumber(
      price.times(percentage).toNumber(),
      market?.value?.priceTensMultiplier || 0
    )
  })

  return {
    isLimitOrder,
    totalWorstPrice,
    worstPrice,
    worstPriceWithSlippage,
    totalWorstPriceWithSlippageAndFees,
    hasEnoughLiquidity
  }
}

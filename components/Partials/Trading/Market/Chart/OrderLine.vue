<script lang="ts" setup>
import { SpotLimitOrder, DerivativeLimitOrder } from '@injectivelabs/sdk-ts'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import { UiSpotMarket, UiDerivativeMarket } from '@/types'

const props = defineProps<{
  isSpot: boolean
  market: UiSpotMarket | UiDerivativeMarket
  order: SpotLimitOrder | DerivativeLimitOrder
}>()

const { valueToString: priceToString } = useSharedBigNumberFormatter(
  computed(() => {
    if (!props.order) {
      return 0
    }

    return props.isSpot
      ? sharedToBalanceInWei({
          value: props.order.price,
          decimalPlaces:
            props.market.baseToken.decimals - props.market.quoteToken.decimals
        })
      : new BigNumberInWei(props.order.price).toBase(
          props.market.quoteToken.decimals
        )
  }),
  {
    shouldTruncate: true,
    decimalPlaces: props.market.priceDecimals
  }
)

const { valueToString: quantityToString } = useSharedBigNumberFormatter(
  computed(() => {
    if (!props.order) {
      return 0
    }

    return props.isSpot
      ? new BigNumberInWei(props.order.quantity).toBase(
          (props.market as UiSpotMarket).baseToken.decimals
        )
      : new BigNumberInBase(props.order.quantity)
  }),
  {
    shouldTruncate: true,
    decimalPlaces: props.market.quantityDecimals
  }
)

defineExpose({
  orderHash: props.order.orderHash,
  priceToString: priceToString.value,
  quantityToString: quantityToString.value
})
</script>

<template>
  <div />
</template>

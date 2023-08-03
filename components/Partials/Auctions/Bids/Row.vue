<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInWei } from '@injectivelabs/utils'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  quantity: {
    type: String,
    required: true
  }
})

const priceCalculated = computed(() =>
  new BigNumberInWei(props.price).toBase(
    props.market.quoteToken.decimals - props.market.baseToken.decimals
  )
)

const quantityCalculated = computed(() =>
  new BigNumberInWei(props.quantity).toBase(props.market.baseToken.decimals)
)

const totalAmount = computed(() =>
  priceCalculated.value.times(quantityCalculated.value)
)

const { valueToString: priceToString } = useBigNumberFormatter(
  priceCalculated,
  { decimalPlaces: 3 }
)

const { valueToString: quantityToString } = useBigNumberFormatter(
  quantityCalculated,
  { decimalPlaces: 3 }
)

const { valueToString: totalAmountToString } = useBigNumberFormatter(
  totalAmount,
  { decimalPlaces: 3 }
)
</script>

<template>
  <tr class="font-mono border-t border-gray-700">
    <td class="py-4">
      <span class="text-green-500">{{ priceToString }}</span>
    </td>
    <td class="text-right pr-2">
      <span>
        {{ quantityToString }}
      </span>
    </td>
    <td class="text-right pr-2">
      <span>
        {{ totalAmountToString }}
      </span>
    </td>
  </tr>
</template>

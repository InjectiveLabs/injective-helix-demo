<script setup lang="ts">
import {
  UiSpotMarketWithToken,
  UiSpotOrderHistory
} from '@injectivelabs/sdk-ui-ts'
import { OrderState } from '@injectivelabs/ts-types'
import { format } from 'date-fns'
import { PropType } from 'nuxt/dist/app/compat/capi'

const props = defineProps({
  order: {
    type: Object as PropType<UiSpotOrderHistory>,
    required: true
  },
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const spotStore = useSpotStore()

const { orderStatus, price, quantity, total } = useOrderHistory(
  computed(() => props.order),
  computed(() => true)
)

const createdAt = computed(() =>
  format(props.order.createdAt, 'dd MMM HH:mm:ss')
)

function handleCancelOrder() {
  const order = spotStore.subaccountOrders.find(
    (order) => order.orderHash === props.order.orderHash
  )
  if (order) {
    spotStore.cancelOrder(order)
  }
}
</script>

<template>
  <tr class="text-sm border-t border-gray-700">
    <td class="py-4 pr-2 font-semibold">{{ createdAt }}</td>
    <td class="px-2">
      <span class="font-semibold mr-1">{{ price.toFixed(2) }}</span>
      <span class="text-gray-500 font-semibold">USDT</span>
    </td>
    <td class="text-right px-2">{{ quantity.toFixed(2) }}</td>
    <td class="text-right px-2">
      <span class="mr-1">{{ total.toFixed(2) }}</span>
      <span class="text-gray-500">USDT</span>
    </td>
    <td
      class="text-right px-2"
      :class="{
        'text-green-500': order.state === OrderState.PartiallyFilled,
        'text-red-500': order.state === OrderState.Canceled
      }"
    >
      {{ orderStatus }}
    </td>
    <td
      v-if="
        [OrderState.Booked, OrderState.PartiallyFilled].includes(order.state as OrderState)
      "
      class="w-0"
    >
      <AppButton
        sm
        class="text-red-500 bg-red-500 bg-opacity-10 font-semibold hover:text-white ml-4"
        @click="handleCancelOrder"
      >
        <span class="whitespace-nowrap"> Cancel Bid </span>
      </AppButton>
    </td>
  </tr>
</template>

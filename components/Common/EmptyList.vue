<script lang="ts" setup>
import { TradeSubPage } from '@/types'

const route = useRoute()
const slots = useSlots()

withDefaults(
  defineProps<{
    message?: string
  }>(),
  {
    message: ''
  }
)

const isTradePage = computed(
  () =>
    route.name &&
    [TradeSubPage.Spot, TradeSubPage.Stocks, TradeSubPage.Futures].includes(
      route.name as TradeSubPage
    )
)
</script>

<template>
  <div class="h-full w-full flex flex-col items-center py-6">
    <p
      class="text-coolGray-475 capitalize"
      :class="[
        slots.default ? 'mb-6' : '',
        isTradePage ? 'text-xs' : 'text-sm'
      ]"
    >
      {{ message }}
    </p>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'nuxt/dist/app/compat/capi'
import type { TradingStrategy } from '@injectivelabs/indexer-proto-ts/esm/injective_trading_rpc'
import { BigNumberInWei } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { format } from 'date-fns'

const props = defineProps({
  strategy: {
    type: Object as PropType<TradingStrategy>,
    required: true
  }
})

const gridStore = useGridStore()

const upperBounds = computed(() => {
  if (!gridStore.market) {
    return ZERO_IN_BASE
  }

  return new BigNumberInWei(props.strategy.upperBound).toBase(
    gridStore.market.quoteToken.decimals - gridStore.market.baseToken.decimals
  )
})

const lowerBounds = computed(() => {
  if (!gridStore.market) {
    return ZERO_IN_BASE
  }

  return new BigNumberInWei(props.strategy.lowerBound).toBase(
    gridStore.market.quoteToken.decimals - gridStore.market.baseToken.decimals
  )
})

const baseQuantity = computed(() =>
  new BigNumberInWei(props.strategy.baseQuantity).toBase(
    gridStore.market?.baseToken.decimals || 16
  )
)

const createdAt = computed(() =>
  format(new Date(Number(props.strategy.createdAt)), 'HH:mm:ss dd/LL/yyyy')
)

const pnl = computed(() => `-`)
</script>
<template>
  <div
    class="grid grid-cols-6 items-center text-right text-xs hover:bg-gray-700 p-4 even:bg-gray-950"
  >
    <div class="flex space-x-2 items-center">
      <div class="text-left">
        <CommonTokenIcon
          v-if="gridStore.market?.baseToken"
          v-bind="{ token: gridStore.market?.baseToken }"
        />
      </div>
      <div>
        {{ gridStore.market?.ticker }}
      </div>
    </div>

    <div>{{ upperBounds }} {{ gridStore.market?.quoteToken.symbol }}</div>
    <div>{{ lowerBounds }} {{ gridStore.market?.quoteToken.symbol }}</div>
    <div>{{ createdAt }}</div>
    <div>{{ baseQuantity }}</div>
    <div>{{ pnl }}</div>
  </div>
</template>

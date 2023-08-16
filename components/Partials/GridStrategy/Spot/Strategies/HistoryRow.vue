<script setup lang="ts">
import { PropType } from 'nuxt/dist/app/compat/capi'
import type { TradingStrategy } from '@injectivelabs/indexer-proto-ts/esm/injective_trading_rpc'
import { BigNumberInWei } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { format } from 'date-fns'

const gridStrategyStore = useGridStrategyStore()

const props = defineProps({
  strategy: {
    type: Object as PropType<TradingStrategy>,
    required: true
  }
})

const market = computed(() => gridStrategyStore.spotMarket)

const upperBounds = computed(() => {
  if (!market.value) {
    return ZERO_IN_BASE
  }

  return new BigNumberInWei(props.strategy.upperBound).toBase(
    market.value.quoteToken.decimals - market.value.baseToken.decimals
  )
})

const lowerBounds = computed(() => {
  if (!market.value) {
    return ZERO_IN_BASE
  }

  return new BigNumberInWei(props.strategy.lowerBound).toBase(
    market.value.quoteToken.decimals - market.value.baseToken.decimals
  )
})

const baseQuantity = computed(() =>
  new BigNumberInWei(props.strategy.baseQuantity).toBase(
    market.value?.baseToken.decimals || 16
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
          v-if="market?.baseToken"
          v-bind="{ token: market?.baseToken }"
        />
      </div>
      <div>
        {{ market?.ticker }}
      </div>
    </div>

    <div>{{ upperBounds }} {{ market?.quoteToken.symbol }}</div>
    <div>{{ lowerBounds }} {{ market?.quoteToken.symbol }}</div>
    <div>{{ createdAt }}</div>
    <div>{{ baseQuantity }}</div>
    <div>{{ pnl }}</div>
  </div>
</template>

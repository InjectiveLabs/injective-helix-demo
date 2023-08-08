<script setup lang="ts">
import { PropType } from 'nuxt/dist/app/compat/capi'
import { TradingStrategy } from '@injectivelabs/indexer-proto-ts/esm/injective_trading_rpc'

defineProps({
  strategy: {
    type: Object as PropType<TradingStrategy>,
    required: true
  }
})

const tokenStore = useTokenStore()

const token = computed(() => tokenStore.tokens.find((t) => t.denom === 'inj'))
</script>
<template>
  <div class="grid grid-cols-5">
    <div class="p-4">15 Aug 2023</div>
    <div class="p-4">20</div>
    <div class="flex items-center p-4">
      <CommonTokenIcon v-bind="{ token }" />
      <span class="uppercase ml-2">Inj-Usdt</span>
    </div>
    <div class="p-4">30</div>
    <div class="p-4">Running</div>
  </div>
</template>

<script setup lang="ts">
import { UiMarketWithToken } from '@/types'

const props = withDefaults(defineProps<{ market: UiMarketWithToken }>(), {})

const emit = defineEmits<{
  'set:market': [market: UiMarketWithToken]
}>()

function setMarket() {
  emit('set:market', props.market)
}
</script>

<template>
  <div class="flex p-2 hover:bg-brand-800 cursor-pointer" @click="setMarket">
    <div class="flex items-center px-1">
      <CommonTokenIcon v-bind="{ token: market.baseToken }" />
    </div>

    <div class="px-2">
      <p class="font-semibold text-sm">{{ market.ticker }}</p>
      <p class="text-coolGray-500 text-xs">{{ market.baseToken.name }}</p>
    </div>
  </div>
</template>

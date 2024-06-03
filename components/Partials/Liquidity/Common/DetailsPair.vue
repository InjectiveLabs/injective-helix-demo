<script lang="ts" setup>
import { UiSpotMarket } from '@/types'

const { quote, base } = useSlots()

defineProps({
  market: {
    type: Object as PropType<UiSpotMarket>,
    default: undefined
  },

  baseSymbol: {
    type: String,
    default: ''
  },

  quoteSymbol: {
    type: String,
    default: ''
  }
})
</script>
<template>
  <p>
    <span>
      <slot name="base" />
    </span>
    <span class="text-xs opacity-75 align-text-bottom ml-1">
      {{ market ? market.baseToken.symbol : baseSymbol }}
    </span>
    <span v-if="quote && base" class="mx-1 text-sm opacity-75">/</span>
    <span>
      <slot name="quote"></slot>
    </span>
    <span v-if="quote" class="text-xs opacity-75 align-text-bottom ml-1">
      {{ market ? market.quoteToken.symbol : quoteSymbol }}
    </span>
  </p>
</template>

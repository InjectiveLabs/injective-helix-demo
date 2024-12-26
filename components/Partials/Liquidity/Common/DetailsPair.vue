<script lang="ts" setup>
import { UiMarketWithToken } from '@/types'

const { quote, base } = useSlots()

withDefaults(
  defineProps<{
    market?: UiMarketWithToken
    baseSymbol?: string
    quoteSymbol?: string
  }>(),
  {
    market: undefined,
    baseSymbol: '',
    quoteSymbol: ''
  }
)
</script>
<template>
  <p>
    <span>
      <slot name="base" />
    </span>
    <span class="text-xs opacity-75 align-text-bottom ml-1 text-coolGray-450">
      {{ market ? market.baseToken.symbol : baseSymbol }}
    </span>
    <span
      v-if="quote && base"
      class="mx-1 text-sm opacity-75 text-coolGray-450"
    >
      /
    </span>
    <span>
      <slot name="quote"></slot>
    </span>
    <span
      v-if="quote"
      class="text-xs opacity-75 align-text-bottom ml-1 text-coolGray-450"
    >
      {{ market ? market.quoteToken.symbol : quoteSymbol }}
    </span>
  </p>
</template>

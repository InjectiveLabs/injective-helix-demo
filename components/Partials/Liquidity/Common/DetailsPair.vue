<script lang="ts" setup>
import { SpotTradingBotsCyTags } from '@/types'
import type { UiMarketWithToken } from '@/types'

const { quote, base } = useSlots()

withDefaults(
  defineProps<{
    baseSymbol?: string
    quoteSymbol?: string
    market?: UiMarketWithToken
  }>(),
  {
    market: undefined,
    baseSymbol: '',
    quoteSymbol: ''
  }
)
</script>
<template>
  <p class="whitespace-nowrap">
    <span :data-cy="dataCyTag(SpotTradingBotsCyTags.GridDetailsInitialBaseAmount)">
      <slot name="base" />
    </span>
    <span class="text-xs opacity-75 align-text-bottom ml-1 text-coolGray-450" 
    :data-cy="dataCyTag(SpotTradingBotsCyTags.GridDetailsInitialBaseSymbol)">
      {{ market ? market.baseToken.symbol : baseSymbol }}
    </span>
    <span
      v-if="quote && base"
      class="5xl:mx-1 text-sm opacity-75 text-coolGray-450"
    >
      /
    </span>
    <span :data-cy="dataCyTag(SpotTradingBotsCyTags.GridDetailsInitialQuoteAmount)">
      <slot name="quote"></slot>
    </span>
    <span
      v-if="quote"
      class="text-xs opacity-75 align-text-bottom ml-1 text-coolGray-450"
      :data-cy="dataCyTag(SpotTradingBotsCyTags.GridDetailsInitialQuoteSymbol)"
    >
      {{ market ? market.quoteToken.symbol : quoteSymbol }}
    </span>
  </p>
</template>

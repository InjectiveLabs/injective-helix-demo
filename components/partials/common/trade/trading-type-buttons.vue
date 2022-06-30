<template>
  <div class="flex items-center justify-center">
    <VButton
      :class="{
        'text-gray-500': tradingType === TradeExecutionType.Market
      }"
      text-xs
      data-cy="trading-page-switch-to-limit-button"
      @click.stop="onTradingTypeToggle(TradeExecutionType.LimitFill)"
    >
      {{ $t('trade.limit') }}
    </VButton>
    <div class="mx-2 w-px h-4 bg-gray-500"></div>
    <VButton
      :class="{
        'text-gray-500': tradingType === TradeExecutionType.LimitFill
      }"
      text-xs
      data-cy="trading-page-switch-to-market-button"
      @click.stop="onTradingTypeToggle(TradeExecutionType.Market)"
    >
      {{ $t('trade.market') }}
    </VButton>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { TradeExecutionType } from '@injectivelabs/ts-types'

export default Vue.extend({
  props: {
    tradingType: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      TradeExecutionType
    }
  },

  methods: {
    onTradingTypeToggle(tradingType: TradeExecutionType) {
      this.$emit('update:trading-type', tradingType)
    }
  }
})
</script>

<template>
  <div>
    <div>
      <p
        v-if="executionPriceHasHighDeviationWarning && !hasError"
        class="text-2xs text-red-200 mb-4"
      >
        {{ $t('trade.execution_price_far_away_from_last_traded_price') }}
      </p>
      <p v-if="!hasInjForGasOrNotKeplr" class="text-2xs text-red-400 mb-4">
        {{ $t('insufficientGas.tradingFormNote') }}
        <a
          :href="hubUrl"
          target="_blank"
          class="flex items-center text-primary-500"
        >
          <span class="mr-1">Injective Hub</span>
          <IconExternalLink class="w-2 h-2" />
        </a>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'

export default Vue.extend({
  props: {
    hasInjForGasOrNotKeplr: {
      type: Boolean,
      required: true
    },

    hasError: {
      type: Boolean,
      required: true
    },

    executionPrice: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    lastTradedPrice: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    orderTypeBuy: {
      type: Boolean,
      required: true
    },

    priceHasHighDeviationWarning: {
      type: Boolean,
      required: true
    },

    tradingTypeMarket: {
      type: Boolean,
      required: true
    }
  },

  computed: {
    hubUrl(): string {
      return 'https://hub.injective.network/bridge'
    }
  }
})
</script>

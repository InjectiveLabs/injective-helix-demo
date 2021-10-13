<template>
  <div class="flex flex-col h-full items-start">
    <div class="p-2 w-full">
      <p class="text-xs uppercase text-gray-400 flex">
        {{ $t('portfolio_value') }}
        <v-icon-info-tooltip
          class="ml-2"
          :tooltip="$t('portfolio_value_tooltip')"
        />
      </p>
      <h2 class="mt-4 text-lg lg:text-2xl font-mono text-gray-100 flex">
        {{ portfolioValueToFormat }} USD
      </h2>
      <p v-if="false" class="mt-2 text-xs text-gray-400">
        <span class="text-aqua-500">+ $150.00 (5.27%)</span> in 24h
      </p>
    </div>
    <p
      class="mt-auto px-2 text-xs text-primary-500 hover:text-primary-600 uppercase font-semibold cursor-pointer"
      @click="$root.$emit('toggle-market-slideout')"
    >
      {{ $t('start_trading') }}
    </p>
  </div>
</template>

<script lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import Vue from 'vue'

export default Vue.extend({
  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    portfolioValue(): string {
      return this.$accessor.account.portfolioValue
    },

    portfolioValueToFormat(): string {
      const { portfolioValue } = this

      return new BigNumberInBase(portfolioValue).toFormat(2)
    }
  }
})
</script>

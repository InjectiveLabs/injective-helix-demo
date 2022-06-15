<template>
  <div class="mt-4">
    <span
      v-if="!hasEnoughInjForGasOrNotKeplr"
      class="block mt-4 text-2xs font-semibold text-red-500 first-of-type:mt-0"
    >
      {{ $t('insufficientGas.tradingFormNote') }}
    </span>
    <span
      v-if="amountError"
      class="block mt-4 text-2xs font-semibold text-red-500 first-of-type:mt-0"
    >
      {{ amountError }}
      <router-link
        v-if="showPortfolioLink"
        :to="{ name: 'portfolio' }"
        class="text-primary-600"
      >
        {{ $t('trade.convert.go_to_portfolio') }} &rarr;
      </router-link>
      <a
        v-if="showHubLink"
        href="https://hub.injective.network/"
        target="_blank"
        class="text-primary-600"
      >
        {{ $t('trade.convert.go_to_hub') }} &rarr;
      </a>
    </span>
    <span
      v-if="priceError"
      class="block mt-4 text-2xs font-semibold text-red-500 first-of-type:mt-0"
    >
      {{ priceError }}
      <router-link
        v-if="showPortfolioLink"
        :to="{ name: 'portfolio' }"
        class="text-primary-600"
      >
        {{ $t('trade.convert.go_to_portfolio') }} &rarr;
      </router-link>
      <a
        v-if="showHubLink"
        href="https://hub.injective.network/"
        target="_blank"
        class="text-primary-600"
      >
        {{ $t('trade.convert.go_to_hub') }} &rarr;
      </a>
    </span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Wallet } from '@injectivelabs/ts-types'

export default Vue.extend({
  props: {
    errors: {
      type: Object,
      required: true
    },

    showPortfolioLink: {
      type: Boolean,
      default: false
    },

    showHubLink: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    priceError(): string | null {
      const { price } = this.errors
      return price || null
    },

    amountError(): string | null {
      const { amount } = this.errors
      return amount || null
    },

    wallet(): Wallet {
      return this.$accessor.wallet.wallet
    },

    hasEnoughInjForGas(): boolean {
      return this.$accessor.bank.hasEnoughInjForGas
    },

    hasEnoughInjForGasOrNotKeplr(): boolean {
      const { wallet, hasEnoughInjForGas } = this
      if (wallet !== Wallet.Keplr) {
        return true
      }
      return hasEnoughInjForGas
    }
  }
})
</script>

<template>
  <div>
    <div>
      <p
        v-if="
          executionPriceHasHighDeviationWarning &&
          !hasInputErrors &&
          !hasAdvancedSettingsErrors
        "
        class="text-2xs text-red-200 mb-4"
      >
        {{ $t('trade.execution_price_far_away_from_last_traded_price') }}
      </p>
      <p
        v-if="!hasEnoughInjForGasOrNotKeplr"
        class="text-2xs text-red-400 mb-4"
      >
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
import { Wallet } from '@injectivelabs/ts-types'
import { DEFAULT_MARKET_PRICE_WARNING_DEVIATION } from '~/app/utils/constants'

export default Vue.extend({
  props: {
    hasEnoughInjForGasOrNotKeplr: {
      type: Boolean,
      required: true
    },

    hasInputErrors: {
      type: Boolean,
      required: true
    },

    hasAdvancedSettingsErrors: {
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

    tradingTypeMarket: {
      type: Boolean,
      required: true
    },

    wallet: {
      type: String,
      required: true
    }
  },

  computed: {
    hasEnoughInjForGas(): boolean {
      return this.$accessor.bank.hasEnoughInjForGas
    },

    executionPriceHasHighDeviationWarning(): boolean {
      const {
        executionPrice,
        orderTypeBuy,
        tradingTypeMarket,
        lastTradedPrice
      } = this

      if (!tradingTypeMarket) {
        return false
      }

      if (executionPrice.lte(0)) {
        return false
      }

      const deviation = new BigNumberInBase(1)
        .minus(
          orderTypeBuy
            ? lastTradedPrice.dividedBy(executionPrice)
            : executionPrice.dividedBy(lastTradedPrice)
        )
        .times(100)

      return deviation.gt(DEFAULT_MARKET_PRICE_WARNING_DEVIATION)
    },

    hasInjForGasOrNotKeplr(): boolean {
      const { wallet, hasEnoughInjForGas } = this

      if (wallet !== Wallet.Keplr) {
        return true
      }

      return hasEnoughInjForGas
    },

    hubUrl(): string {
      return 'https://hub.injective.network/bridge'
    }
  },

  watch: {
    hasInjForGasOrNotKeplr(hasEnoughInjForGasOrNotKeplr) {
      this.$emit(
        'update:has-enough-inj-for-gas-or-not-keplr',
        hasEnoughInjForGasOrNotKeplr
      )
    }
  }
})
</script>

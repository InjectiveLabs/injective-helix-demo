<template>
  <div
    v-if="slippageWarning || slippageTooHighError"
    class="flex mt-4 gap-2 text-xs font-semibold"
    :class="slippageWarning ? 'text-warning' : 'text-error'"
    font-semibold
    text-2xs
  >
    <IconExclamationCircleFill />
    <span v-if="slippageWarning">
      {{ slippageWarning }}
    </span>
    <span v-if="slippageTooHighError">
      {{ slippageTooHighError }}
    </span>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'

export default Vue.extend({
  props: {
    slippageTolerance: {
      type: String,
      required: true
    },

    tradingTypeMarket: {
      type: Boolean,
      required: true
    }
  },

  computed: {
    slippageWarning(): string | undefined {
      const { slippageTolerance, tradingTypeMarket } = this

      if (!tradingTypeMarket) {
        return undefined
      }

      const slippageToleranceToBigNumber = new BigNumberInBase(
        slippageTolerance
      )

      if (
        slippageToleranceToBigNumber.gt(new BigNumberInBase(5)) &&
        slippageToleranceToBigNumber.isLessThan(new BigNumberInBase(50))
      ) {
        return this.$t('trade.high_slippage_warning')
      }

      if (slippageToleranceToBigNumber.isLessThan(new BigNumberInBase(0.05))) {
        return this.$t('trade.low_slippage_tolerance_warning')
      }

      return undefined
    },

    slippageTooHighError(): string | undefined {
      const { slippageTolerance } = this

      const slippageToleranceToBigNumber = new BigNumberInBase(
        slippageTolerance
      )

      if (slippageToleranceToBigNumber.gt(new BigNumberInBase(50))) {
        return this.$t('trade.invalid_slippage')
      }

      return undefined
    }
  },

  watch: {
    slippageWarning(warning: boolean) {
      const hasWarning = !!warning

      this.$emit('update:hasWarning', hasWarning)
    },

    slippageTooHighError(error: boolean) {
      const hasError = !!error

      this.$emit('update:hasError', hasError)
    }
  }
})
</script>

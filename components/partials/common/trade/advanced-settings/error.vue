<template>
  <div
    v-if="hasWarning || hasError"
    class="flex mt-4 gap-2 text-xs font-semibold"
    :class="hasWarning ? 'text-warning' : 'text-error'"
    font-semibold
    text-2xs
  >
    <IconExclamationCircleFill />
    <span v-if="hasWarning">
      {{ slippageWarning }}
    </span>
    <span v-if="hasError">
      {{ slippageError }}
    </span>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { TradeError } from 'types/errors'

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
    slippageError(): string | undefined {
      const { slippageTooHighError } = this

      if (slippageTooHighError) {
        return slippageTooHighError.slippage
      }

      return ''
    },

    hasWarning(): boolean {
      const { slippageWarning } = this
      if (slippageWarning) {
        return true
      }

      return false
    },

    hasError(): boolean {
      const { slippageError } = this
      if (slippageError) {
        return true
      }

      return false
    },

    slippageWarning(): string {
      const { slippageTolerance, tradingTypeMarket } = this

      if (!tradingTypeMarket) {
        return ''
      }

      if (
        new BigNumberInBase(slippageTolerance).gt(new BigNumberInBase(5)) &&
        new BigNumberInBase(slippageTolerance).isLessThan(
          new BigNumberInBase(50)
        )
      ) {
        return this.$t('trade.high_slippage_warning')
      }

      if (
        new BigNumberInBase(slippageTolerance).isLessThan(
          new BigNumberInBase(0.05)
        )
      ) {
        return this.$t('trade.low_slippage_tolerance_warning')
      }

      return ''
    },

    slippageTooHighError(): TradeError | undefined {
      const { slippageTolerance } = this

      if (new BigNumberInBase(slippageTolerance).gt(new BigNumberInBase(50))) {
        return {
          slippage: this.$t('trade.invalid_slippage')
        }
      }

      return undefined
    }
  },

  watch: {
    hasWarning(hasWarning: boolean) {
      this.$emit('update:has-warning', hasWarning)
    },

    hasError(hasError: boolean) {
      this.$emit('update:has-error', hasError)
    }
  }
})
</script>

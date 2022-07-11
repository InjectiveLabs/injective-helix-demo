<template>
  <div class="flex flex-col bg-gray-800 rounded-lg p-6 h-full">
    <div class="flex justify-start gap-6 lg:gap-8">
      <div class="flex flex-col">
        <span class="text-gray-500 uppercase tracking-wide text-xs mb-2 font-semibold whitespace-nowrap">
          {{ $t('fee_discounts.my_staked_amount') }}
        </span>
        <span class="uppercase text-xs lg:text-base text-gray-500 font-bold tracking-widest whitespace-nowrap">
          <b class="text-xl lg:text-2xl font-bold text-white tracking-normal font-mono">{{ stakedAmountToFormat }}</b> INJ
        </span>
      </div>
    </div>
    <div class="mt-4">
      <span class="text-xs text-gray-400">
        {{ $t('fee_discounts.current_apr') }}: {{ aprToFormat }}%
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { cosmosSdkDecToBigNumber, FeeDiscountAccountInfo } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '~/app/utils/constants'

export default Vue.extend({
  computed: {
    feeDiscountAccountInfo(): FeeDiscountAccountInfo | undefined {
      return this.$accessor.exchange.feeDiscountAccountInfo
    },

    apr(): BigNumberInBase {
      return this.$accessor.params.apr
    },

    aprToFormat(): string {
      const { apr } = this

      return apr.times(100).toFormat(2)
    },

    stakedAmount(): BigNumberInBase {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo || !feeDiscountAccountInfo.accountInfo) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        cosmosSdkDecToBigNumber(feeDiscountAccountInfo.accountInfo.stakedAmount)
      )
    },

    stakedAmountToFormat(): string {
      const { stakedAmount } = this

      return stakedAmount.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    }
  }
})
</script>

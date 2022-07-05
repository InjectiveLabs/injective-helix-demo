<template>
  <div class="flex flex-col bg-gray-800 rounded-lg p-6 h-full">
    <div class="flex justify-start gap-6 lg:gap-8">
      <div class="flex flex-col border-r border-gray-500 pr-6 lg:pr-8">
        <span class="text-gray-500 uppercase tracking-wide text-xs mb-2 font-semibold whitespace-nowrap">
          {{ $t('fee_discounts.my_tier') }}
        </span>
        <span class="uppercase text-xl lg:text-2xl font-bold tracking-normal text-primary-500">
          #{{ tierLevel }}
        </span>
      </div>
      <div class="flex flex-col">
        <span class="text-gray-500 uppercase tracking-wide text-xs mb-2 font-semibold whitespace-nowrap">
          {{ $t('fee_discounts.maker') }}
        </span>
        <span class="uppercase text-xs lg:text-base text-gray-500 font-bold tracking-widest whitespace-nowrap">
          <b class="text-xl lg:text-2xl font-bold text-white tracking-normal font-mono">{{ makerFeeDiscount }}%</b> {{ $t('fee_discounts.off') }}
        </span>
      </div>
      <div class="flex flex-col">
        <span class="text-gray-500 uppercase tracking-wide text-xs mb-2 font-semibold whitespace-nowrap">
          {{ $t('fee_discounts.taker') }}
        </span>
        <span class="uppercase text-xs lg:text-base text-gray-500 font-bold tracking-widest whitespace-nowrap">
          <b class="text-xl lg:text-2xl font-bold text-white tracking-normal font-mono">{{ takerFeeDiscount }}%</b> {{ $t('fee_discounts.off') }}
        </span>
      </div>
    </div>
    <div class="mt-4">
      <span v-if="lastUpdateTimestamp" class="text-xs text-gray-400">
        {{ $t('fee_discounts.update_daily') }}. {{ $t('fee_discounts.last_updated_at') }} {{ lastUpdateTimestamp }}
      </span>
      <span v-else class="text-xs text-gray-400">&mdash;</span>
    </div>
  </div>
</template>

<script lang="ts">
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { FeeDiscountAccountInfo } from '@injectivelabs/sdk-ts'
import Vue from 'vue'
import { format } from 'date-fns'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '~/app/utils/constants'

export default Vue.extend({
  computed: {
    feeDiscountAccountInfo(): FeeDiscountAccountInfo | undefined {
      return this.$accessor.exchange.feeDiscountAccountInfo
    },

    tierLevel(): number {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return 0
      }

      return new BigNumberInBase(
        feeDiscountAccountInfo.tierLevel || 0
      ).toNumber()
    },

    makerFeeDiscount(): string {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return ''
      }

      if (!feeDiscountAccountInfo.accountInfo) {
        return ''
      }

      return new BigNumberInWei(
        feeDiscountAccountInfo.accountInfo.makerDiscountRate
      )
        .toBase()
        .times(100)
        .toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    takerFeeDiscount(): string {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return ''
      }

      if (!feeDiscountAccountInfo.accountInfo) {
        return ''
      }

      return new BigNumberInWei(
        feeDiscountAccountInfo.accountInfo.takerDiscountRate
      )
        .toBase()
        .times(100)
        .toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    lastUpdateTimestamp(): string | undefined {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo || !feeDiscountAccountInfo.accountTtl) {
        return undefined
      }

      return format(
        Number(feeDiscountAccountInfo.accountTtl.ttlTimestamp) * 1000,
        'yyyy-MM-dd HH:mm:ss (zzz)'
      )
    }
  }
})
</script>

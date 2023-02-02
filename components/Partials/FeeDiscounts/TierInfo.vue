<script lang="ts" setup>
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { format } from 'date-fns'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'

const exchangeStore = useExchangeStore()

const feeDiscountAccountInfo = computed(() => {
  return exchangeStore.feeDiscountAccountInfo
})

const tierLevel = computed(() => {
  if (!feeDiscountAccountInfo.value) {
    return 0
  }

  return new BigNumberInBase(
    feeDiscountAccountInfo.value.tierLevel || 0
  ).toNumber()
})

const makerFeeDiscount = computed(() => {
  if (!feeDiscountAccountInfo.value) {
    return ''
  }

  if (!feeDiscountAccountInfo.value.accountInfo) {
    return ''
  }

  return new BigNumberInWei(
    feeDiscountAccountInfo.value.accountInfo.makerDiscountRate
  )
    .toBase()
    .times(100)
    .toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
})

const takerFeeDiscount = computed(() => {
  if (!feeDiscountAccountInfo.value) {
    return ''
  }

  if (!feeDiscountAccountInfo.value.accountInfo) {
    return ''
  }

  return new BigNumberInWei(
    feeDiscountAccountInfo.value.accountInfo.takerDiscountRate
  )
    .toBase()
    .times(100)
    .toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
})

const lastUpdateTimestamp = computed(() => {
  if (
    !feeDiscountAccountInfo.value ||
    !feeDiscountAccountInfo.value.accountTtl
  ) {
    return undefined
  }

  return format(
    Number(feeDiscountAccountInfo.value.accountTtl.ttlTimestamp) * 1000,
    'yyyy-MM-dd HH:mm:ss (zzz)'
  )
})
</script>

<template>
  <div class="flex flex-col bg-gray-850 rounded-lg p-6 h-full">
    <div class="flex justify-start gap-6 lg:gap-8">
      <div class="flex flex-col border-r border-gray-500 pr-6 lg:pr-8">
        <span
          class="text-gray-500 uppercase tracking-wide text-xs mb-2 font-semibold whitespace-nowrap"
        >
          {{ $t('fee_discounts.my_tier') }}
        </span>
        <span
          class="uppercase text-xl lg:text-2xl font-bold tracking-normal text-blue-500"
        >
          #{{ tierLevel }}
        </span>
      </div>
      <div class="flex flex-col">
        <span
          class="text-gray-500 uppercase tracking-wide text-xs mb-2 font-semibold whitespace-nowrap"
        >
          {{ $t('fee_discounts.maker') }}
        </span>
        <span
          class="uppercase text-xs lg:text-base text-gray-500 font-bold tracking-widest whitespace-nowrap"
        >
          <b
            class="text-xl lg:text-2xl font-bold text-white tracking-normal font-mono"
          >
            {{ makerFeeDiscount }}%
          </b>
          {{ $t('fee_discounts.off') }}
        </span>
      </div>
      <div class="flex flex-col">
        <span
          class="text-gray-500 uppercase tracking-wide text-xs mb-2 font-semibold whitespace-nowrap"
        >
          {{ $t('fee_discounts.taker') }}
        </span>
        <span
          class="uppercase text-xs lg:text-base text-gray-500 font-bold tracking-widest whitespace-nowrap"
        >
          <b
            class="text-xl lg:text-2xl font-bold text-white tracking-normal font-mono"
          >
            {{ takerFeeDiscount }}%
          </b>
          {{ $t('fee_discounts.off') }}
        </span>
      </div>
    </div>
    <div class="mt-4">
      <span v-if="lastUpdateTimestamp" class="text-xs text-gray-400">
        {{ $t('fee_discounts.update_daily') }}.
        {{ $t('fee_discounts.last_updated_at') }} {{ lastUpdateTimestamp }}
      </span>
      <span v-else class="text-xs text-gray-400">&mdash;</span>
    </div>
  </div>
</template>

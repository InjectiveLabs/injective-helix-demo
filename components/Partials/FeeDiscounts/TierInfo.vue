<script lang="ts" setup>
import { format } from 'date-fns'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'

const exchangeStore = useExchangeStore()

const tierLevel = computed(() =>
  new BigNumberInBase(
    exchangeStore.feeDiscountAccountInfo?.tierLevel || 0
  ).toNumber()
)

const makerFeeDiscount = computed(() => {
  if (!exchangeStore.feeDiscountAccountInfo) {
    return ''
  }

  if (!exchangeStore.feeDiscountAccountInfo.accountInfo) {
    return ''
  }

  return new BigNumberInWei(
    exchangeStore.feeDiscountAccountInfo.accountInfo.makerDiscountRate
  )
    .toBase()
    .times(100)
    .toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
})

const takerFeeDiscount = computed(() => {
  if (!exchangeStore.feeDiscountAccountInfo) {
    return ''
  }

  if (!exchangeStore.feeDiscountAccountInfo.accountInfo) {
    return ''
  }

  return new BigNumberInWei(
    exchangeStore.feeDiscountAccountInfo.accountInfo.takerDiscountRate
  )
    .toBase()
    .times(100)
    .toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
})

const lastUpdateTimestamp = computed(() => {
  if (
    !exchangeStore.feeDiscountAccountInfo ||
    !exchangeStore.feeDiscountAccountInfo.accountTtl
  ) {
    return undefined
  }

  return format(
    Number(exchangeStore.feeDiscountAccountInfo.accountTtl.ttlTimestamp) * 1000,
    'yyyy-MM-dd HH:mm:ss (zzz)'
  )
})
</script>

<template>
  <div class="flex flex-col bg-coolGray-850 rounded-lg p-6 h-full">
    <div class="flex justify-start gap-6 lg:gap-8 max-xs:flex-col">
      <div class="flex flex-col xs:border-r border-coolGray-500 pr-6 lg:pr-8">
        <span
          class="text-coolGray-500 uppercase tracking-wide text-xs mb-2 font-semibold whitespace-nowrap"
        >
          {{ $t('feeDiscounts.myFeeTier') }}
        </span>
        <span
          class="uppercase text-xl lg:text-2xl font-bold tracking-normal text-blue-500"
        >
          #{{ tierLevel }}
        </span>
      </div>

      <div class="flex gap-6 lg:gap-8">
        <div class="flex flex-col">
          <span
            class="text-coolGray-500 uppercase tracking-wide text-xs mb-2 font-semibold whitespace-nowrap"
          >
            {{ $t('feeDiscounts.maker') }}
          </span>
          <span
            class="uppercase text-xs lg:text-base text-coolGray-500 font-bold tracking-widest whitespace-nowrap"
          >
            <b class="text-xl lg:text-2xl font-bold text-white tracking-normal">
              {{ makerFeeDiscount }}%
            </b>
            {{ $t('feeDiscounts.off') }}
          </span>
        </div>

        <div class="flex flex-col">
          <span
            class="text-coolGray-500 uppercase tracking-wide text-xs mb-2 font-semibold whitespace-nowrap"
          >
            {{ $t('feeDiscounts.taker') }}
          </span>
          <span
            class="uppercase text-xs lg:text-base text-coolGray-500 font-bold tracking-widest whitespace-nowrap"
          >
            <b class="text-xl lg:text-2xl font-bold text-white tracking-normal">
              {{ takerFeeDiscount }}%
            </b>
            {{ $t('feeDiscounts.off') }}
          </span>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <span v-if="lastUpdateTimestamp" class="text-xs text-coolGray-400">
        {{ $t('feeDiscounts.updateDaily') }}.
        {{ $t('feeDiscounts.lastUpdatedAt') }} {{ lastUpdateTimestamp }}
      </span>
      <span v-else class="text-xs text-coolGray-400">&mdash;</span>
    </div>
  </div>
</template>

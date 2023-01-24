<script lang="ts" setup>
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { cosmosSdkDecToBigNumber } from '@injectivelabs/sdk-ts'
import { intervalToDuration } from 'date-fns'
import { getAbbreviatedVolume } from '@/app/utils/market'
import { USDT_DECIMALS } from '@/app/utils/constants'

const exchangeStore = useExchangeStore()

const feeDiscountAccountInfo = computed(() => {
  return exchangeStore.feeDiscountAccountInfo
})

const feeDiscountSchedule = computed(() => {
  return exchangeStore.feeDiscountSchedule
})

const volume = computed(() => {
  if (
    !feeDiscountAccountInfo.value ||
    !feeDiscountAccountInfo.value.accountInfo ||
    !feeDiscountAccountInfo.value.accountInfo.volume
  ) {
    return ZERO_IN_BASE
  }

  const volume = new BigNumberInBase(
    cosmosSdkDecToBigNumber(feeDiscountAccountInfo.value.accountInfo.volume)
  )

  return new BigNumberInWei(volume).toBase(USDT_DECIMALS)
})

const volumeToFormat = computed(() => {
  if (volume.value.eq(ZERO_IN_BASE)) {
    return '0.00'
  }

  return getAbbreviatedVolume(volume.value)
})

const daysPassed = computed(() => {
  if (!feeDiscountSchedule.value) {
    return '0'
  }

  const totalinSeconds =
    feeDiscountSchedule.value.bucketDuration *
    feeDiscountSchedule.value.bucketCount

  const { days } = intervalToDuration({
    start: 0,
    end: totalinSeconds * 1000
  })

  if (!days) {
    return '0'
  }

  return days.toString()
})
</script>

<template>
  <div class="flex flex-col bg-gray-850 rounded-lg p-6 h-full">
    <div class="flex justify-start gap-6 lg:gap-8">
      <div class="flex flex-col">
        <span
          class="text-gray-500 uppercase tracking-wide text-xs mb-2 font-semibold whitespace-nowrap"
        >
          {{ $t('fee_discounts.my_trading_volume') }}
        </span>
        <span
          class="uppercase text-xs lg:text-base text-gray-500 font-bold tracking-widest whitespace-nowrap"
        >
          <b
            class="text-xl lg:text-2xl font-bold text-white tracking-normal font-mono"
          >
            {{ volumeToFormat }}
          </b>
          USD
        </span>
      </div>
    </div>
    <div class="mt-4">
      <span class="text-xs text-gray-400">
        {{ $t('fee_discounts.in_past_days', { days: daysPassed }) }}
      </span>
    </div>
  </div>
</template>

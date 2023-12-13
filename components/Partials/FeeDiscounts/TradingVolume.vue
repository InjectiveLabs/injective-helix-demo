<script lang="ts" setup>
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { cosmosSdkDecToBigNumber } from '@injectivelabs/sdk-ts'
import { intervalToDuration } from 'date-fns'
import {
  UI_MINIMAL_ABBREVIATION_FLOOR,
  USDT_DECIMALS
} from '@/app/utils/constants'

const exchangeStore = useExchangeStore()

const volume = computed(() => {
  if (
    !exchangeStore.feeDiscountAccountInfo ||
    !exchangeStore.feeDiscountAccountInfo.accountInfo ||
    !exchangeStore.feeDiscountAccountInfo.accountInfo.volume
  ) {
    return ZERO_IN_BASE
  }

  const volume = new BigNumberInBase(
    cosmosSdkDecToBigNumber(
      exchangeStore.feeDiscountAccountInfo.accountInfo.volume
    )
  )

  return new BigNumberInWei(volume).toBase(USDT_DECIMALS)
})

const shouldAbbreviateVolume = computed(() =>
  volume.value.gte(UI_MINIMAL_ABBREVIATION_FLOOR)
)

const { valueToString: volumeToFormat } = useBigNumberFormatter(volume, {
  decimalPlaces: shouldAbbreviateVolume.value ? 0 : 2,
  abbreviationFloor: shouldAbbreviateVolume.value
    ? UI_MINIMAL_ABBREVIATION_FLOOR
    : undefined
})

const daysPassed = computed(() => {
  if (!exchangeStore.feeDiscountSchedule) {
    return '0'
  }

  const totalInSeconds =
    exchangeStore.feeDiscountSchedule.bucketDuration *
    exchangeStore.feeDiscountSchedule.bucketCount

  const { days } = intervalToDuration({
    start: 0,
    end: totalInSeconds * 1000
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
          {{ $t('feeDiscounts.my_trading_volume') }}
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
        {{ $t('feeDiscounts.in_past_days', { days: daysPassed }) }}
      </span>
    </div>
  </div>
</template>

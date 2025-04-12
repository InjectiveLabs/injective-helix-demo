<script lang="ts" setup>
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { cosmosSdkDecToBigNumber } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'

const exchangeStore = useExchangeStore()
const sharedParamStore = useSharedParamStore()

const { valueToString: aprToFormat } = useSharedBigNumberFormatter(
  computed(() => sharedParamStore.apr.times(100)),
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const stakedAmount = computed(() => {
  if (
    !exchangeStore.feeDiscountAccountInfo ||
    !exchangeStore.feeDiscountAccountInfo.accountInfo
  ) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(
    cosmosSdkDecToBigNumber(
      exchangeStore.feeDiscountAccountInfo.accountInfo.stakedAmount
    )
  )
})

const { valueToString: stakedAmountToFormat } = useSharedBigNumberFormatter(
  stakedAmount,
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)
</script>

<template>
  <div class="flex flex-col bg-coolGray-850 rounded-lg p-6 h-full">
    <div class="flex justify-start gap-6 lg:gap-8">
      <div class="flex flex-col">
        <span
          class="text-coolGray-500 uppercase tracking-wide text-xs mb-2 font-semibold whitespace-nowrap"
        >
          {{ $t('feeDiscounts.my_staked_amount') }}
        </span>
        <span
          class="uppercase text-xs lg:text-base text-coolGray-500 font-bold tracking-widest whitespace-nowrap"
        >
          <b class="text-xl lg:text-2xl font-bold text-white tracking-normal">
            {{ stakedAmountToFormat }}
          </b>
          INJ
        </span>
      </div>
    </div>
    <div class="mt-4">
      <span class="text-xs text-coolGray-400">
        {{ $t('feeDiscounts.current_apr') }}: ≈ {{ aprToFormat }}%
      </span>
    </div>
  </div>
</template>

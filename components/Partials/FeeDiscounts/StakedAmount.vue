<script lang="ts" setup>
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { cosmosSdkDecToBigNumber } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'

const exchangeStore = useExchangeStore()
const sharedParamStore = useSharedParamStore()

const apr = computed(() => sharedParamStore.apr.times(100))

const feeDiscountStakedAmount = computed(() => {
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
</script>

<template>
  <div class="flex flex-col bg-coolGray-850 rounded-lg p-6 h-full">
    <div class="flex justify-start gap-6 lg:gap-8">
      <div class="flex flex-col">
        <span
          class="text-coolGray-500 uppercase tracking-wide text-xs mb-2 font-semibold whitespace-nowrap"
        >
          {{ $t('feeDiscounts.myStakedAmount') }}
        </span>
        <span
          class="uppercase text-xs lg:text-base text-coolGray-500 font-bold tracking-widest whitespace-nowrap"
        >
          <b class="text-xl lg:text-2xl font-bold text-white tracking-normal">
            <SharedAmount
              v-bind="{
                amount: feeDiscountStakedAmount,
                decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
            />
          </b>
          INJ
        </span>
      </div>
    </div>
    <div class="mt-4">
      <span class="text-xs text-coolGray-400">
        {{ $t('feeDiscounts.currentApr') }}: ≈
        <SharedAmount
          v-bind="{
            amount: apr,
            decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
          }"
        />%
      </span>
    </div>
  </div>
</template>

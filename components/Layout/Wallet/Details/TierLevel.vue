<script lang="ts" setup>
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { NuxtUiIcons } from '@shared/types'
import { UI_MINIMAL_AMOUNT } from '@/app/utils/constants'
import { MainPage } from '@/types'

const exchangeStore = useExchangeStore()

const accountInfo = computed(() => {
  if (!exchangeStore.feeDiscountAccountInfo) {
    return
  }

  return exchangeStore.feeDiscountAccountInfo.accountInfo
})

const tierLevel = computed(() => {
  if (!exchangeStore.feeDiscountAccountInfo) {
    return 0
  }

  return new BigNumberInBase(
    exchangeStore.feeDiscountAccountInfo.tierLevel || 0
  ).toNumber()
})

const takerFeeDiscount = computed(() => {
  if (!accountInfo.value) {
    return ''
  }

  const takerFeeDiscount = new BigNumberInWei(
    accountInfo.value.takerDiscountRate
  ).toBase()

  if (takerFeeDiscount.lte(UI_MINIMAL_AMOUNT)) {
    return '0'
  }

  return takerFeeDiscount.times(100).toFormat()
})

const makerFeeDiscount = computed(() => {
  if (!accountInfo.value) {
    return ''
  }

  const makerFeeDiscount = new BigNumberInWei(
    accountInfo.value.makerDiscountRate
  ).toBase()

  if (makerFeeDiscount.lte(UI_MINIMAL_AMOUNT)) {
    return '0'
  }

  return makerFeeDiscount.times(100).toFormat()
})
</script>

<template>
  <div class="flex items-center justify-between text-xs">
    <span class="font-semibold">
      {{ $t(`feeDiscounts.tier`) }}
    </span>

    <NuxtLink
      :to="{ name: MainPage.FeeDiscounts }"
      class="text-green-500 hover:opacity-80 flex items-center gap-2"
    >
      <span>
        {{
          tierLevel > 0
            ? $t('navigation.makerTakerFee', {
                maker: makerFeeDiscount,
                taker: takerFeeDiscount
              })
            : $t('navigation.noTierLevel')
        }}
      </span>
      <UIcon :name="NuxtUiIcons.ArrowDiagonalRight" class="h-4 w-4 min-w-4" />
    </NuxtLink>
  </div>
</template>

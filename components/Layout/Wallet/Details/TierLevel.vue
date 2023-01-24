<script lang="ts" setup>
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'

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

  return new BigNumberInWei(accountInfo.value.takerDiscountRate)
    .toBase()
    .toFormat()
})

const makerFeeDiscount = computed(() => {
  if (!accountInfo.value) {
    return ''
  }

  return new BigNumberInWei(accountInfo.value.makerDiscountRate)
    .toBase()
    .toFormat()
})
</script>

<template>
  <div class="flex items-center justify-between text-xs">
    <span class="font-semibold">
      {{ $t('fee_discounts.tier') }}
    </span>

    <NuxtLink
      :to="{ name: 'fee-discounts' }"
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
      <BaseIcon name="external-link-arrow" xs />
    </NuxtLink>
  </div>
</template>

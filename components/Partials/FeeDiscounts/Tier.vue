<script lang="ts" setup>
import { usdtToken } from '@shared/data/token'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import {
  cosmosSdkDecToBigNumber,
  getExactDecimalsFromNumber
} from '@injectivelabs/sdk-ts'
import { UI_MINIMAL_AMOUNT } from '@/app/utils/constants'
import type { FeeDiscountTierInfo } from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    index: number
    tier: FeeDiscountTierInfo
  }>(),
  {}
)

const exchangeStore = useExchangeStore()
const sharedWalletStore = useSharedWalletStore()

const isUserTierLevel = computed(() => {
  if (!sharedWalletStore.isUserConnected) {
    return false
  }

  if (!exchangeStore.feeDiscountAccountInfo) {
    return false
  }

  return new BigNumberInBase(exchangeStore.feeDiscountAccountInfo.tierLevel).eq(
    props.index
  )
})

const feeDiscountStakedAmount = computed(
  () =>
    new BigNumberInBase(cosmosSdkDecToBigNumber(props.tier.stakedAmount || 0))
)

const volume = computed(() =>
  new BigNumberInWei(cosmosSdkDecToBigNumber(props.tier.volume || 0)).toBase(
    usdtToken.decimals
  )
)

const makerFeeDiscount = computed(() => {
  if (!props.tier.makerDiscountRate) {
    return ZERO_IN_BASE
  }

  const makerDiscountRate = new BigNumberInWei(props.tier.makerDiscountRate)
    .times(100)
    .toBase()

  if (makerDiscountRate.lte(UI_MINIMAL_AMOUNT)) {
    return ZERO_IN_BASE
  }

  return makerDiscountRate
})

const takerFeeDiscount = computed(() => {
  if (!props.tier.takerDiscountRate) {
    return ZERO_IN_BASE
  }

  const takerDiscountRate = new BigNumberInWei(props.tier.takerDiscountRate)
    .times(100)
    .toBase()

  if (takerDiscountRate.lte(UI_MINIMAL_AMOUNT)) {
    return ZERO_IN_BASE
  }

  return takerDiscountRate
})

const { valueToString: makerFeeDiscountToFormat } = useSharedBigNumberFormatter(
  makerFeeDiscount,
  {
    decimalPlaces: getExactDecimalsFromNumber(makerFeeDiscount.value.toNumber())
  }
)

const { valueToString: feeDiscountStakedAmountToFormat } =
  useSharedBigNumberFormatter(feeDiscountStakedAmount, {
    decimalPlaces: 0
  })

const { valueToString: volumeToFormat } = useSharedBigNumberFormatter(volume, {
  decimalPlaces: 0
})

const { valueToString: takerFeeDiscountToFormat } = useSharedBigNumberFormatter(
  takerFeeDiscount,
  {
    decimalPlaces: getExactDecimalsFromNumber(takerFeeDiscount.value.toNumber())
  }
)
</script>

<template>
  <tr>
    <td class="h-8 text-left">
      <div class="flex items-center gap-4">
        <div
          v-if="isUserTierLevel"
          class="bg-blue-500 w-2 h-2 ml-2 rounded-full"
        />
        <div v-else class="w-2 h-2 ml-2" />
        <span>#{{ index }}</span>
      </div>
    </td>
    <td class="h-8 text-right">
      &#8805; {{ feeDiscountStakedAmountToFormat }}
      <span class="text-xs text-coolGray-500"> INJ </span>
    </td>
    <td class="h-8 text-right">
      <span class="text-coolGray-500 uppercase text-xs tracking-wider">
        {{ $t('common.and') }}
      </span>
    </td>
    <td class="h-8 text-right">
      &#8805; {{ volumeToFormat }}
      <span class="text-xs text-coolGray-500"> USD </span>
    </td>
    <td class="h-8 text-right">{{ makerFeeDiscountToFormat }}%</td>
    <td class="h-8 text-right">{{ takerFeeDiscountToFormat }}%</td>
  </tr>
</template>

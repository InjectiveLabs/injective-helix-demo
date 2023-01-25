<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import {
  FeeDiscountTierInfo,
  getExactDecimalsFromNumber,
  cosmosSdkDecToBigNumber
} from '@injectivelabs/sdk-ts'
import { UI_MINIMAL_AMOUNT, USDT_DECIMALS } from '@/app/utils/constants'

const props = defineProps({
  tier: {
    required: true,
    type: Object as PropType<FeeDiscountTierInfo>
  },

  index: {
    required: true,
    type: Number
  }
})

const walletStore = useWalletStore()
const exchangeStore = useExchangeStore()

const isUserWalletConnected = computed(() => {
  return walletStore.isUserWalletConnected
})

const feeDiscountAccountInfo = computed(() => {
  return exchangeStore.feeDiscountAccountInfo
})

const isUserTierLevel = computed(() => {
  if (!feeDiscountAccountInfo.value || !isUserWalletConnected.value) {
    return false
  }

  return new BigNumberInBase(feeDiscountAccountInfo.value.tierLevel).eq(
    props.index
  )
})

const stakedAmount = computed(() => {
  if (!props.tier.stakedAmount) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(cosmosSdkDecToBigNumber(props.tier.stakedAmount))
})

const { valueToString: stakedAmountToFormat } = useBigNumberFormatter(
  stakedAmount,
  {
    decimalPlaces: 0
  }
)

const volume = computed(() => {
  if (!props.tier.volume) {
    return ZERO_IN_BASE
  }

  return new BigNumberInWei(cosmosSdkDecToBigNumber(props.tier.volume)).toBase(
    USDT_DECIMALS
  )
})

const { valueToString: volumeToFormat } = useBigNumberFormatter(volume, {
  decimalPlaces: 0
})

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

const { valueToString: makerFeeDiscountToFormat } = useBigNumberFormatter(
  makerFeeDiscount,
  {
    decimalPlaces: getExactDecimalsFromNumber(makerFeeDiscount.value.toNumber())
  }
)

const takerFeeDiscount = computed(() => {
  if (!props.tier.takerDiscountRate) {
    return ZERO_IN_BASE
  }

  return new BigNumberInWei(props.tier.takerDiscountRate).times(100).toBase()
})

const { valueToString: takerFeeDiscountToFormat } = useBigNumberFormatter(
  takerFeeDiscount,
  {
    decimalPlaces: getExactDecimalsFromNumber(takerFeeDiscount.value.toNumber())
  }
)
</script>

<template>
  <tr>
    <td class="h-8 text-left font-mono">
      <div class="flex items-center gap-4">
        <div
          v-if="isUserTierLevel"
          class="bg-blue-500 w-2 h-2 ml-2 rounded-full"
        />
        <div v-else class="w-2 h-2 ml-2" />
        <span>#{{ index }}</span>
      </div>
    </td>
    <td class="h-8 text-right font-mono">
      &#8805; {{ stakedAmountToFormat }}
      <span class="text-2xs text-gray-500"> INJ </span>
    </td>
    <td class="h-8 text-right font-mono">
      <span class="text-gray-500 uppercase text-2xs tracking-wider">
        {{ $t('and') }}
      </span>
    </td>
    <td class="h-8 text-right font-mono">
      &#8805; {{ volumeToFormat }}
      <span class="text-2xs text-gray-500"> USD </span>
    </td>
    <td class="h-8 text-right font-mono">{{ makerFeeDiscountToFormat }}%</td>
    <td class="h-8 text-right font-mono">{{ takerFeeDiscountToFormat }}%</td>
  </tr>
</template>

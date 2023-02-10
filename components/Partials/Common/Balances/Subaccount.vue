<script lang="ts" setup>
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { PropType } from 'vue'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { UiMarketWithToken } from '@/types'

interface SubaccountBalance {
  availableBalance: string
  totalBalance: string
}

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  baseTradingBalance: {
    type: Object as PropType<SubaccountBalance>,
    default: undefined
  },

  quoteTradingBalance: {
    type: Object as PropType<SubaccountBalance>,
    default: undefined
  }
})

const baseTradingAvailableBalanceToFormat = computed(() => {
  if (!props.baseTradingBalance || !props.baseTradingBalance.availableBalance) {
    return ZERO_IN_BASE.toFormat(
      props.market.quantityDecimals,
      BigNumberInBase.ROUND_DOWN
    )
  }

  return new BigNumberInWei(props.baseTradingBalance.availableBalance)
    .toBase(props.market.baseToken.decimals)
    .toFormat(props.market.quantityDecimals, BigNumberInBase.ROUND_DOWN)
})

const quoteTradingAvailableBalanceToFormat = computed(() => {
  if (
    !props.quoteTradingBalance ||
    !props.quoteTradingBalance.availableBalance
  ) {
    return ZERO_IN_BASE.toFormat(
      props.market.quantityDecimals,
      BigNumberInBase.ROUND_DOWN
    )
  }

  return new BigNumberInWei(props.quoteTradingBalance.availableBalance)
    .toBase(props.market.quoteToken.decimals)
    .toFormat(props.market.quantityDecimals, BigNumberInBase.ROUND_DOWN)
})
</script>

<template>
  <div>
    <div
      v-if="baseTradingBalance"
      class="flex justify-between items-center text-xs mb-4"
    >
      <span class="text-gray-500">
        {{ $t('trade.available_asset', { asset: market.baseToken.symbol }) }}
      </span>
      <span class="font-mono text-white">{{
        baseTradingAvailableBalanceToFormat
      }}</span>
    </div>

    <div class="flex justify-between items-center text-xs">
      <span class="text-gray-500">
        {{ $t('trade.available_asset', { asset: market.quoteToken.symbol }) }}
      </span>
      <div class="flex gap-2">
        <PartialsCommonBalancesPeggyUsdcConvert
          v-if="market"
          :market="market"
        />
        <span class="font-mono text-white">{{
          quoteTradingAvailableBalanceToFormat
        }}</span>
      </div>
    </div>
  </div>
</template>

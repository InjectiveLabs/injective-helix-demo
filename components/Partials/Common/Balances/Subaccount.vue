<script lang="ts" setup>
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { PropType } from 'vue'
import {
  ZERO_IN_BASE,
  UiSubaccountBalanceWithToken
} from '@injectivelabs/sdk-ui-ts'
import { UiMarketWithToken } from '@/types'

const props = defineProps({
  market: {
    required: true,
    type: Object as PropType<UiMarketWithToken>
  },

  baseTradingBalance: {
    required: false,
    default: undefined,
    type: Object as PropType<UiSubaccountBalanceWithToken>
  },

  quoteTradingBalance: {
    default: undefined,
    type: Object as PropType<UiSubaccountBalanceWithToken>
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
      <span class="font-mono text-white">{{
        quoteTradingAvailableBalanceToFormat
      }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumber, BigNumberInWei } from '@injectivelabs/utils'
import { format } from 'date-fns'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { FundingPayment } from '@injectivelabs/sdk-ts'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_MAX_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { getMarketRoute } from '@/app/utils/market'

const derivativeStore = useDerivativeStore()

const props = defineProps({
  fundingPayment: {
    required: true,
    type: Object as PropType<FundingPayment>
  }
})

const UI_MINIMAL_AMOUNT = new BigNumber(1).shiftedBy(-6)
const market = computed(() => {
  const result = derivativeStore.markets.find(
    (m) => m.marketId === props.fundingPayment.marketId
  )

  if (!result) {
    // TODO: No valid market found in exchangeDerivativesApi.fetchMarkets() response.
    // Find a way to get correct market anyway.
  }

  return result
})

const total = computed(() => {
  if (!props.fundingPayment.amount) {
    return ZERO_IN_BASE
  }

  const decimals = market.value
    ? market.value.quoteToken.decimals
    : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS

  return new BigNumberInWei(props.fundingPayment.amount).toBase(decimals)
})

const time = computed(() => {
  if (!props.fundingPayment.timestamp) {
    return ''
  }

  return format(props.fundingPayment.timestamp, 'dd MMM HH:mm:ss')
})

const marketRoute = computed(() => {
  if (!market.value) {
    return { name: 'markets' }
  }

  const marketRoute = getMarketRoute(market.value)

  return marketRoute || { name: 'markets' }
})
</script>
<template>
  <CommonTableRow v-if="market" dense>
    <div
      class="flex items-center justify-between col-span-2 text-xs leading-5 pb-1"
    >
      <div class="flex flex-col">
        <NuxtLink class="flex items-center justify-start" :to="marketRoute">
          <div v-if="market.baseToken" class="w-4 h-4">
            <CommonTokenIcon :token="market.baseToken" sm />
          </div>
          <div class="ml-1">
            <span class="text-gray-200 font-semibold text-xs">
              {{ market.ticker }}
            </span>
          </div>
        </NuxtLink>
        <span class="text-gray-200 text-xs font-mono">{{ time }}</span>
      </div>
      <div>
        <AppNumber
          v-if="total.abs().gt(UI_MINIMAL_AMOUNT)"
          data-cy="funding-payments-total-table-data"
          :class="{
            'text-green-500': total.gte(0),
            'text-red-500': total.lt(0)
          }"
          :decimals="UI_DEFAULT_MAX_DISPLAY_DECIMALS"
          :prefix="total.lt(0) ? '-' : ''"
          :number="total"
        >
          <template #addon>
            <span class="text-2xs text-gray-500">
              {{ market.quoteToken.symbol }}
            </span>
          </template>
        </AppNumber>
        <span
          v-else
          :class="{
            'text-green-500': total.gte(0),
            'text-red-500': total.lt(0)
          }"
        >
          {{ `< ${UI_MINIMAL_AMOUNT.toFormat(6)}` }}
        </span>
      </div>
    </div>
  </CommonTableRow>
</template>

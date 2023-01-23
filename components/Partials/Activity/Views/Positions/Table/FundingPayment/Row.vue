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
  <tr
    v-if="market"
    :data-cy="'funding-payments-table-row-' + market.ticker"
    class="h-12"
  >
    <td class="font-mono pl-3">
      <span class="text-gray-400 text-sm">{{ time }}</span>
    </td>

    <td class="text-left cursor-pointer">
      <NuxtLink class="flex items-center justify-start" :to="marketRoute">
        <div v-if="market.baseToken" class="w-6 h-6">
          <CommonTokenIcon v-if="market.baseToken" :token="market.baseToken" />
        </div>
        <div class="ml-3">
          <span
            class="text-gray-200 font-semibold"
            data-cy="funding-payments-ticker-name-table-data"
          >
            {{ market.ticker }}
          </span>
        </div>
      </NuxtLink>
    </td>

    <td class="text-right font-mono pr-3">
      <AppNumber
        v-if="total.abs().gt(UI_MINIMAL_AMOUNT)"
        data-cy="funding-payments-total-table-data"
        :class="{
          'text-green-500': total.gte(0),
          'text-red-500': total.lt(0)
        }"
        :decimals="UI_DEFAULT_MAX_DISPLAY_DECIMALS"
        :number="total"
      >
        <template #addon>
          <span class="text-sm text-gray-500">
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
        <span class="text-gray-500">{{ market.quoteToken.symbol }}</span>
      </span>
    </td>
  </tr>
</template>

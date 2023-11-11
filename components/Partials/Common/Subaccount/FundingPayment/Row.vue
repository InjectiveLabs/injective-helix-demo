<script lang="ts" setup>
import { FundingPayment } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_MAX_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { getMarketRoute } from '@/app/utils/market'

const props = defineProps({
  fundingPayment: {
    required: true,
    type: Object as PropType<FundingPayment>
  }
})

const { market, time, total, minimalDisplayAmount } = useFundingPayment(
  computed(() => props.fundingPayment)
)

const marketRoute = computed(() => {
  if (!market.value) {
    return undefined
  }

  return getMarketRoute(market.value)
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
        v-if="total.abs().gt(minimalDisplayAmount)"
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
        {{ `< ${minimalDisplayAmount.toFormat(6)}` }}
        <span class="text-gray-500">{{ market.quoteToken.symbol }}</span>
      </span>
    </td>
  </tr>
</template>

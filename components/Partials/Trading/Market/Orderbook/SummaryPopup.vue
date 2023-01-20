<script lang="ts" setup>
import { PropType } from 'vue'
import {
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken,
  UiOrderbookSummary
} from '@injectivelabs/sdk-ui-ts'

const props = defineProps({
  summary: {
    type: Object as PropType<UiOrderbookSummary>,
    required: true
  },

  market: {
    type: Object as PropType<
      UiDerivativeMarketWithToken | UiSpotMarketWithToken
    >,
    required: true
  }
})

const { valueToString: averagePriceToString } = useBigNumberFormatter(
  computed(() => props.summary.total.dividedBy(props.summary.quantity)),
  {
    decimalPlaces: props.market.priceDecimals
  }
)
</script>

<template>
  <div
    v-if="summary"
    class="p-4 bg-gray-700 rounded-xl flex flex-col flex-wrap text-xs min-w-2xs"
  >
    <div class="flex justify-between items-center mb-2">
      <span class="font-bold">{{ $t('trade.average_price') }}:</span>
      <span>≈ {{ averagePriceToString }}</span>
    </div>
    <div class="flex justify-between items-center mb-2">
      <span class="font-bold">
        {{
          $t('trade.total_volume_in_quote', {
            symbol: market.baseToken.symbol
          })
        }}:
      </span>
      <span>
        <AppNumber
          :decimals="market.quantityDecimals"
          :number="props.summary.quantity"
          dont-group-values
        />
      </span>
    </div>
    <div class="flex justify-between items-center">
      <span class="font-bold">
        {{
          $t('trade.total_volume_in_base', {
            symbol: market.quoteToken.symbol
          })
        }}:
      </span>
      <span class="flex items-center">
        <AppNumber
          :decimals="market.priceDecimals"
          :number="props.summary.total"
          dont-group-values
        />
      </span>
    </div>
  </div>
</template>

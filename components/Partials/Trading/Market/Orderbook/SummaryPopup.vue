<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_MINIMAL_ABBREVIATION_FLOOR } from '@/app/utils/constants'
import { UiMarketWithToken } from '@/types'

const props = defineProps({
  summary: {
    type: Object as PropType<{ quantity: string; total: string }>,
    required: true
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const { valueToString: averagePriceToString } = useBigNumberFormatter(
  computed(() =>
    new BigNumberInBase(props.summary.total).dividedBy(props.summary.quantity)
  ),
  {
    decimalPlaces: props.market.priceDecimals
  }
)
</script>

<template>
  <div
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
          :number-string="summary.quantity"
          :abbreviation-floor="UI_MINIMAL_ABBREVIATION_FLOOR"
          is-no-grouping
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
          :number-string="summary.total"
          is-no-grouping
        />
      </span>
    </div>
  </div>
</template>

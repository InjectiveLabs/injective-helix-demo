<script lang="ts" setup>
import { UiSpotMarket, InvestmentTypeGst } from '@/types'

defineProps({
  threshold: {
    type: String,
    required: true
  },

  market: {
    type: Object as PropType<UiSpotMarket>,
    required: true
  },

  investmentType: {
    type: String as PropType<InvestmentTypeGst>,
    required: true
  }
})
</script>

<template>
  <CommonHeaderTooltip
    class="inline-block text-xs font-semibold"
    text-color-class="text-gray-500"
    border-color-class="border-gray-500"
    :tooltip="
      $t('sgt.minInvestmentTooltip', {
        amount: threshold,
        assets:
          investmentType === InvestmentTypeGst.Base
            ? 'base'
            : investmentType === InvestmentTypeGst.Quote
            ? 'quote'
            : `base and quote`
      })
    "
  >
    <span v-if="investmentType === InvestmentTypeGst.Base">
      {{
        $t('sgt.minInvestmentDescription', {
          symbols: market.baseToken.symbol,
          amount: threshold
        })
      }}
    </span>

    <span v-else-if="investmentType === InvestmentTypeGst.Quote">
      {{
        $t('sgt.minInvestmentDescription', {
          symbols: market.quoteToken.symbol,
          amount: threshold
        })
      }}
    </span>

    <span v-else>
      {{
        $t('sgt.minInvestmentDescription', {
          symbols: `${market.baseToken.symbol} + ${market.quoteToken.symbol}`,
          amount: threshold
        })
      }}
    </span>
  </CommonHeaderTooltip>
</template>

<script lang="ts" setup>
import { UiSpotMarket, InvestmentTypeGst } from '@/types'

withDefaults(
  defineProps<{
    market: UiSpotMarket
    threshold: string
    investmentType?: InvestmentTypeGst
  }>(),
  {
    investmentType: InvestmentTypeGst.Quote
  }
)
</script>

<template>
  <CommonHeaderTooltip
    class="inline-block text-2xs font-semibold tracking-[0.3px]"
    text-color-class="text-coolGray-450"
    border-color-class="border-coolGray-450"
    :tooltip="
      $t('sgt.minInvestmentTooltip', {
        amount: threshold,
        assets:
          investmentType === InvestmentTypeGst.Base
            ? $t('common.base')
            : investmentType === InvestmentTypeGst.Quote
            ? $t('common.quote')
            : $t('common.baseAndQuote')
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

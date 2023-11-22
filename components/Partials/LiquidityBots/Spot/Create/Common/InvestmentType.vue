<script lang="ts" setup>
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { InvestmentTypeGst, SpotGridTradingField } from '@/types'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const setFormValues = useSetFormValues()

const { value: investmentTypeValue } = useStringField({
  name: SpotGridTradingField.InvestmentType
})

const options = computed(() => [
  {
    value: InvestmentTypeGst.BaseAndQuote,
    display: `${props.market.baseToken.symbol} + ${props.market.quoteToken.symbol}`
  },
  {
    value: InvestmentTypeGst.Base,
    display: `${props.market.baseToken.symbol} Only`
  },
  {
    value: InvestmentTypeGst.Quote,
    display: `${props.market.quoteToken.symbol} Only`
  }
])

function changeType(type: InvestmentTypeGst) {
  investmentTypeValue.value = type

  if (type === InvestmentTypeGst.Base) {
    setFormValues({ [SpotGridTradingField.InvestmentAmount]: '' }, false)
  }

  if (type === InvestmentTypeGst.Quote) {
    setFormValues({ [SpotGridTradingField.BaseInvestmentAmount]: '' }, false)
  }
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-4">
    <div>
      <p class="font-bold text-sm">{{ $t('liquidity.deposit') }}</p>
    </div>
    <div class="flex">
      <div class="border border-gray-700 rounded bg-gray-950 p-1">
        <button
          v-for="option in options"
          :key="option.value"
          class="rounded py-1 px-3 text-xs"
          :class="{ 'bg-gray-800': option.value === investmentTypeValue }"
          @click="changeType(option.value)"
        >
          {{ option.display }}
        </button>
      </div>
    </div>
  </div>
</template>

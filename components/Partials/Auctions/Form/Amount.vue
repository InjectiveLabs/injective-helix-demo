<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { GridSpotTradingField, GridSpotTradingForm } from '@/types'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  },
  availableUsd: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const formValues = useFormValues<GridSpotTradingForm>()

const { value: baseAmountValue } = useStringField({
  name: GridSpotTradingField.BaseAmount,
  initialValue: ''
})
const { value: quoteAmountValue } = useStringField({
  name: GridSpotTradingField.QuoteAmount,
  initialValue: '',
  dynamicRule: computed(() => `between:1,${props.availableUsd.toFixed()}`)
})

function handleBaseAmountUpdate(value: string) {
  baseAmountValue.value = value

  if (formValues.value.bidPrice) {
    quoteAmountValue.value = new BigNumberInBase(value)
      .times(formValues.value.bidPrice)
      .toFixed(3)
  }
}

function handleQuoteAmountUpdate(value: string) {
  quoteAmountValue.value = value

  if (formValues.value.bidPrice) {
    baseAmountValue.value = new BigNumberInBase(value)
      .dividedBy(formValues.value.bidPrice)
      .toFixed(3)
  }
}
</script>

<template>
  <p class="font-bold my-2">Amount</p>
  <div class="gap-4 grid grid-cols-2">
    <AppInputNumeric
      v-bind="{ modelValue: baseAmountValue, placeholder: '0.000' }"
      @update:modelValue="handleBaseAmountUpdate"
    >
      <template #addon>
        <span>{{ market.baseToken.symbol }}</span>
      </template>
    </AppInputNumeric>

    <AppInputNumeric
      v-bind="{ modelValue: quoteAmountValue, placeholder: '0.000' }"
      @update:modelValue="handleQuoteAmountUpdate"
    >
      <template #prefix>
        <span>≈</span>
      </template>

      <template #addon>
        <span>{{ market.quoteToken.symbol }}</span>
      </template>
    </AppInputNumeric>
  </div>
</template>

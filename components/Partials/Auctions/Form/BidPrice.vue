<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { PropType } from 'nuxt/dist/app/compat/capi'
import { AuctionTradingField, AuctionTradingForm } from '~/types'

defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const formValues = useFormValues<AuctionTradingForm>()

const { value: bidPriceValue } = useStringField({
  name: AuctionTradingField.BidPrice,
  initialValue: '',
  dynamicRule: computed(() => `minValue:1`)
})

function handleValueUpdate(value: string) {
  bidPriceValue.value = value

  if (formValues.value.baseAmount) {
    formValues.value.quoteAmount = new BigNumberInBase(value)
      .times(formValues.value.baseAmount)
      .toFixed(3)
  }
}
</script>

<template>
  <AppInputNumeric
    v-bind="{
      modelValue: bidPriceValue,
      maxDecimals: market ? market.quantityDecimals : 6,
      placeholder: '0.000'
    }"
    @update:modelValue="handleValueUpdate"
  >
    <template #context>
      <p class="font-bold my-2">Bid Price</p>
    </template>

    <template #addon>
      {{ market.quoteToken.symbol }}
    </template>
  </AppInputNumeric>
</template>

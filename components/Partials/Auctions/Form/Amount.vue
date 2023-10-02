<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { AuctionTradingField, AuctionTradingForm } from '@/types'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const formValues = useFormValues<AuctionTradingForm>()
const { accountBalancesWithToken } = useBalance()

const availableUsd = computed(() => {
  const quoteBalance = accountBalancesWithToken.value.find(
    (balance) => balance.denom === props.market.quoteDenom
  )
  return new BigNumberInWei(quoteBalance?.availableMargin || '0').toBase(
    props.market.quoteToken.decimals
  )
})

const { value: baseAmountValue } = useStringField({
  name: AuctionTradingField.BaseAmount,
  initialValue: ''
})
const { value: quoteAmountValue } = useStringField({
  name: AuctionTradingField.QuoteAmount,
  initialValue: '',
  dynamicRule: computed(() => `between:1,${availableUsd.value.toFixed()}`)
})

function handleBaseAmountUpdate(value: string) {
  baseAmountValue.value = value

  if (formValues.value[AuctionTradingField.BidPrice]) {
    quoteAmountValue.value = new BigNumberInBase(value)
      .times(formValues.value[AuctionTradingField.BidPrice])
      .toFixed(3)
  }
}

function handleQuoteAmountUpdate(value: string) {
  quoteAmountValue.value = value

  if (formValues.value[AuctionTradingField.BidPrice]) {
    baseAmountValue.value = new BigNumberInBase(value)
      .dividedBy(formValues.value[AuctionTradingField.BidPrice])
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

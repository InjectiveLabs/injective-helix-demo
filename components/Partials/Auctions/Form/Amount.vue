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

const { value: baseAmountValue, errorMessage: baseAmountErrorMessage } =
  useStringField({
    name: AuctionTradingField.BaseAmount,
    initialValue: '',
    rule: 'requiredSgt'
  })
const { value: quoteAmountValue, errorMessage: quoteAmountErrorMessage } =
  useStringField({
    name: AuctionTradingField.QuoteAmount,
    initialValue: '',
    rule: 'requiredSgt',
    dynamicRule: computed(
      () => `insufficientSgt:${availableUsd.value.toFixed()}`
    )
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

  <div class="mt-2">
    <p
      v-if="quoteAmountErrorMessage"
      class="text-red-500 text-xs font-semibold"
    >
      {{ quoteAmountErrorMessage }}
    </p>

    <p
      v-else-if="baseAmountErrorMessage"
      class="text-red-500 text-xs font-semibold"
    >
      {{ baseAmountErrorMessage }}
    </p>
  </div>
</template>

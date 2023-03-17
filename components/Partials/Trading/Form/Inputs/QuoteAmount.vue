<script lang="ts" setup>
import { PropType, Ref } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { formatAmountToAllowableAmount } from '@injectivelabs/sdk-ts'
import { TradeField, TradeForm, UiMarketWithToken } from '@/types'

const formValues = useFormValues() as Ref<TradeForm>

const props = defineProps({
  amountStep: {
    type: String,
    required: true
  },

  fees: {
    type: Object as PropType<BigNumberInBase>,
    default: undefined
  },

  quoteAmountFieldName: {
    type: String as PropType<TradeField>,
    required: true
  },

  quoteAvailableBalance: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const emit = defineEmits<{
  (
    e: 'update:amount',
    { amount, isBaseAmount }: { amount?: string; isBaseAmount: boolean }
  ): void
}>()

const { hasTriggerPrice, tradingTypeStopMarket } =
  useDerivativeFormFormatter(formValues)

const { value: quoteAmount } = useStringField({
  name: props.quoteAmountFieldName,
  rule: '',
  dynamicRule: computed(() => {
    const rules = []

    const formIsStopMarketAndHasNoTriggerPrice =
      tradingTypeStopMarket.value && !hasTriggerPrice.value

    if (!formIsStopMarketAndHasNoTriggerPrice) {
      rules.push(`integer:${TradeField.QuoteAmount}`)
    }

    return rules.join('|')
  })
})

function onQuoteAmountChange(quoteAmount: string) {
  formValues.value[TradeField.ProportionalPercentage] = 0

  emit('update:amount', { amount: quoteAmount || '0', isBaseAmount: false })
}

function onQuoteAmountBlur() {
  if (props.market.quantityTensMultiplier < 1) {
    return
  }

  formValues.value[TradeField.BaseAmount] = formatAmountToAllowableAmount(
    formValues.value[TradeField.BaseAmount],
    props.market.quantityTensMultiplier
  )

  emit('update:amount', {
    isBaseAmount: true
  })
}
</script>

<template>
  <AppInputNumeric
    v-model="quoteAmount"
    :max-decimals="market.priceDecimals"
    :placeholder="amountStep"
    :step="amountStep"
    min="0"
    @update:modelValue="onQuoteAmountChange"
    @blur="onQuoteAmountBlur"
  >
    <template #prefix>
      <span>≈</span>
    </template>

    <template #addon>
      <span>{{ market.quoteToken.symbol }}</span>
    </template>
  </AppInputNumeric>
</template>

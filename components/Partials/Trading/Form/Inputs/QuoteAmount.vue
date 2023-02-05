<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { formatAmountToAllowableAmount } from '@injectivelabs/sdk-ts'
import {
  TradeField,
  TradeForm,
  TradeFormValue,
  UiMarketWithToken
} from '@/types'

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

  formValues: {
    type: Object as PropType<TradeForm>,
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
  (e: 'update:formValue', { field, value }: TradeFormValue): void
}>()

const { hasTriggerPrice, tradingTypeStopMarket } = useDerivativeFormFormatter(
  computed(() => props.formValues)
)

const { value: quoteAmount, setValue } = useStringField({
  name: props.quoteAmountFieldName,
  rule: ``,
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
  emit('update:formValue', {
    field: TradeField.ProportionalPercentage,
    value: 0
  })

  emit('update:amount', { amount: quoteAmount || '0', isBaseAmount: false })
}

function onQuoteAmountBlur(quoteAmount = '') {
  setValue(
    formatAmountToAllowableAmount(
      quoteAmount || 0,
      props.market.quantityTensMultiplier
    )
  )
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

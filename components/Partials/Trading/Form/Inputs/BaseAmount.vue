<script lang="ts" setup>
import { PropType } from 'vue'
import { UiPriceLevel, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { formatAmountToAllowableAmount } from '@injectivelabs/sdk-ts'
import {
  TradeExecutionType,
  TradeField,
  TradeForm,
  TradeFormValue,
  UiMarketWithToken
} from '@/types'

const props = defineProps({
  isBuy: Boolean,
  isSpot: Boolean,

  amountStep: {
    type: String,
    required: true
  },

  baseAmountFieldName: {
    type: String as PropType<TradeField>,
    required: true
  },

  baseAvailableBalance: {
    type: Object as PropType<BigNumberInBase>,
    default: ZERO_IN_BASE
  },

  formValues: {
    type: Object as PropType<TradeForm>,
    required: true
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  orderbookOrders: {
    type: Array as PropType<UiPriceLevel[]>,
    required: true
  }
})

const { hasTriggerPrice, tradingTypeStopMarket } = useDerivativeFormFormatter(
  computed(() => props.formValues)
)

const orderbookQuantity = computed(() =>
  props.orderbookOrders.reduce((totalAmount, { quantity }) => {
    const { baseToken } = props.market

    return totalAmount.plus(
      props.isSpot
        ? new BigNumberInWei(quantity).toBase(baseToken.decimals)
        : new BigNumberInWei(quantity)
    )
  }, ZERO_IN_BASE)
)

const emit = defineEmits<{
  (
    e: 'update:amount',
    { amount, isBase }: { amount?: string; isBase: boolean }
  ): void
  (e: 'update:formValue', { field, value }: TradeFormValue): void
}>()

const { value: baseAmount, setValue } = useStringField({
  name: props.baseAmountFieldName,
  rule: '',
  dynamicRule: computed(() => {
    const rules = []

    const formIsStopMarketAndHasNoTriggerPrice =
      tradingTypeStopMarket.value && !hasTriggerPrice.value

    if (!formIsStopMarketAndHasNoTriggerPrice) {
      rules.push(`integer:${TradeField.BaseAmount}`)
    }

    if (!props.isBuy && props.isSpot) {
      rules.push(`insufficientBalance:${props.baseAvailableBalance}`)
    }

    const canSubmitHigherThanOrderbook = [
      TradeExecutionType.LimitFill,
      TradeExecutionType.StopLimit,
      TradeExecutionType.StopMarket
    ].includes(props.formValues[TradeField.TradingType])

    if (!canSubmitHigherThanOrderbook) {
      rules.push(`maxOrderbookLiquidity:${orderbookQuantity.value.toFixed()}`)
    }

    return rules.join('|')
  })
})

function onBaseAmountChange(baseAmount: string) {
  emit('update:formValue', {
    field: TradeField.ProportionalPercentage,
    value: 0
  })

  emit('update:amount', { amount: baseAmount || '0', isBase: true })
}

function onBaseAmountBlur(baseAmount = '') {
  setValue(
    formatAmountToAllowableAmount(
      baseAmount || 0,
      props.market.quantityTensMultiplier
    )
  )
}
</script>

<template>
  <div class="flex-1">
    <AppNumericInput
      v-model="baseAmount"
      :max-decimals="market ? market.quantityDecimals : 6"
      :placeholder="amountStep"
      :step="amountStep"
      min="0"
      @update:modelValue="onBaseAmountChange"
      @blur="onBaseAmountBlur"
    >
      <template #context>
        <p class="text-xs font-semibold text-gray-200 mb-2">
          {{ $t('trade.amount') }}
        </p>
      </template>

      <template #addon>
        <span>{{ market.baseToken.symbol.toUpperCase() }}</span>
      </template>
    </AppNumericInput>
  </div>
</template>

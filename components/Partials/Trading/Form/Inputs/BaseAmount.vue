<script lang="ts" setup>
import { PropType, Ref } from 'vue'
import { UiPriceLevel, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { formatAmountToAllowableAmount } from '@injectivelabs/sdk-ts'
import {
  TradeForm,
  TradeField,
  UiMarketWithToken,
  TradeExecutionType
} from '@/types'
import { SYMBOL_DISPLAY_LENGTH, MAX_SYMBOL_LENGTH } from '@/app/utils/constants'
import { getMinQuantityTickSize } from '@/app/utils/helpers'

const formValues = useFormValues() as Ref<TradeForm>

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

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  orderbookOrders: {
    type: Array as PropType<UiPriceLevel[]>,
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

const baseTokenSymbolFormatted = computed(() => {
  const symbol = props.market.baseToken.symbol.toUpperCase()

  if (symbol.length > MAX_SYMBOL_LENGTH) {
    return `${symbol.slice(0, SYMBOL_DISPLAY_LENGTH)}...`
  }

  return props.market.baseToken.symbol
})

const { value: baseAmount, setValue: setBaseAmountValue } = useStringField({
  name: props.baseAmountFieldName,
  rule: '',
  dynamicRule: computed(() => {
    const rules = [
      `minBaseAmount:${getMinQuantityTickSize(props.isSpot, props.market)}`
    ]

    if (props.market.quantityTensMultiplier >= 1) {
      rules.push(
        `quantityTensMultiplier:${props.market.quantityTensMultiplier}`
      )
    }

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
    ].includes(formValues.value[TradeField.TradingType])

    if (!canSubmitHigherThanOrderbook) {
      rules.push(`maxOrderbookLiquidity:${orderbookQuantity.value.toFixed()}`)
    }

    return rules.join('|')
  })
})

function onBaseAmountChange(baseAmount: string) {
  formValues.value[TradeField.ProportionalPercentage] = 0

  emit('update:amount', { amount: baseAmount || '0', isBaseAmount: true })
}

function onBaseAmountBlur(baseAmount = '') {
  if (props.market.quantityTensMultiplier < 1) {
    return
  }

  const formattedAmount = formatAmountToAllowableAmount(
    baseAmount || 0,
    props.market.quantityTensMultiplier
  )

  setBaseAmountValue(formattedAmount)

  emit('update:amount', { amount: formattedAmount || '0', isBaseAmount: true })
}
</script>

<template>
  <div class="flex-1">
    <AppInputNumeric
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
        <span>{{ baseTokenSymbolFormatted }}</span>
      </template>
    </AppInputNumeric>
  </div>
</template>

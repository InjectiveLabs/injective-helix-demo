<script lang="ts" setup>
import { PropType } from 'vue'
import { formatPriceToAllowablePrice } from '@injectivelabs/sdk-ts'
import { UiPriceLevel } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  TradeField,
  TradeForm,
  TradeFormValue,
  UiMarketWithToken
} from '@/types'
import {
  DEFAULT_MAX_PRICE_BAND_DIFFERENCE,
  DEFAULT_MIN_PRICE_BAND_DIFFERENCE
} from '@/app/utils/constants'

const derivativeStore = useDerivativeStore()
const spotStore = useSpotStore()

const props = defineProps({
  isBase: Boolean,
  isBuy: Boolean,
  isSpot: Boolean,
  tradingTypeLimit: Boolean,
  tradingTypeStopLimit: Boolean,

  formValues: {
    type: Object as PropType<TradeForm>,
    required: true
  },

  lastTradedPrice: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  orderbookOrders: {
    type: Array as PropType<UiPriceLevel[]>,
    default: () => []
  },

  priceFieldName: {
    type: String as PropType<TradeField>,
    required: true
  },

  priceStep: {
    type: String,
    required: true
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    default: () => null
  }
})

const emit = defineEmits<{
  (e: 'update:amount', { isBase }: { isBase: boolean }): void
  (e: 'update:formValue', { field, value }: TradeFormValue): void
}>()

const { hasTriggerPrice, tradingTypeStopMarket } = useDerivativeFormFormatter(
  computed(() => props.formValues)
)

const highestBuy = computed(() => {
  const buys = props.isSpot
    ? spotStore.orderbook?.buys
    : derivativeStore.orderbook?.buys

  const [buy] = buys || []

  return new BigNumberInWei(buy ? buy.price : 0).toBase(
    props.isSpot
      ? props.market.quoteToken.decimals - props.market.baseToken.decimals
      : props.market.quoteToken.decimals
  )
})

const lowestSell = computed(() => {
  const sells = props.isSpot
    ? spotStore.orderbook?.sells
    : derivativeStore.orderbook?.sells

  const [sell] = sells || []

  return new BigNumberInWei(sell ? sell.price : 0).toBase(
    props.isSpot
      ? props.market.quoteToken.decimals - props.market.baseToken.decimals
      : props.market.quoteToken.decimals
  )
})

const middlePrice = computed(() =>
  highestBuy.value.plus(lowestSell.value).dividedBy(2)
)
const acceptableMax = computed(() =>
  middlePrice.value.times(DEFAULT_MAX_PRICE_BAND_DIFFERENCE.div(100))
)

const cappedAcceptableMin = computed(() => {
  const acceptableMin = middlePrice.value.times(
    new BigNumberInBase(1).minus(DEFAULT_MIN_PRICE_BAND_DIFFERENCE.div(100))
  )

  const minTickPrice = new BigNumberInBase(
    new BigNumberInBase(1).shiftedBy(-props.market.priceDecimals)
  )

  return acceptableMin.gt(0) ? acceptableMin : minTickPrice
})

const topOfOrderbookPrice = computed(() => {
  const [order] = props.orderbookOrders

  if (!order) {
    return ''
  }

  return new BigNumberInWei(order.price)
    .toBase(
      props.isSpot
        ? props.market.quoteToken.decimals - props.market.baseToken.decimals
        : props.market.quoteToken.decimals
    )
    .toFixed()
})

const { value: price, setValue: setPriceField } = useStringField({
  name: props.priceFieldName,
  rule: '',
  dynamicRule: computed(() => {
    const rules = [`integer:${props.priceFieldName}`]

    if (props.priceFieldName === TradeField.TriggerPrice) {
      rules.push(
        `triggerPriceEqualsMarkPrice:${derivativeStore.marketMarkPrice}`
      )
    }

    if (
      props.priceFieldName === TradeField.LimitPrice &&
      props.formValues[TradeField.PostOnly]
    ) {
      rules.push(
        `invalidPostOnlyPrice:${topOfOrderbookPrice.value},${props.isBuy}`
      )
    }

    const formIsStopMarketAndHasNoTriggerPrice =
      tradingTypeStopMarket && !hasTriggerPrice

    if (formIsStopMarketAndHasNoTriggerPrice) {
      rules.push(`integer:${TradeField.TriggerPrice}}`)
    }

    if (
      props.tradingTypeLimit &&
      props.lastTradedPrice.gt(0) &&
      middlePrice.value.gt(0) &&
      new BigNumberInBase(props.formValues[TradeField.LimitPrice]).gt(0)
    ) {
      rules.push(
        `priceHighDeviationFromMidOrderbookPrice:${cappedAcceptableMin.value.toFixed()},${acceptableMax.value.toFixed()}`
      )
    }

    return rules.join('|')
  })
})

function recalculateBaseQuoteAmountValue() {
  /* TODO: check if v-model updates price before trying to update the amounts */
  // recalculate base or quote amount input fields
  emit('update:formValue', {
    field: TradeField.ProportionalPercentage,
    value: ''
  })

  emit('update:amount', { isBase: props.isBase })
}

function onPriceBlur(price = '') {
  if (!props.market) {
    return
  }

  const formattedPrice = formatPriceToAllowablePrice(
    price || 0,
    props.market.priceTensMultiplier
  )

  setPriceField(formattedPrice)
}
</script>

<template>
  <div class="mb-6">
    <AppNumericInput
      v-model="price"
      :placeholder="priceStep"
      :step="priceStep"
      :max-decimals="market ? market.priceDecimals : 6"
      min="0"
      @update:modelValue="recalculateBaseQuoteAmountValue"
      @input="recalculateBaseQuoteAmountValue"
      @blur="onPriceBlur"
    >
      <template #context>
        <p class="text-xs font-semibold text-gray-200 mb-2">
          <span v-if="priceFieldName === TradeField.TriggerPrice">
            {{ $t('trade.trigger_price') }}
          </span>
          <span v-else>
            {{ $t('trade.limit_price') }}
          </span>
        </p>
      </template>

      <template #addon>
        <span>{{ market ? market.quoteToken.symbol.toUpperCase() : '' }}</span>
      </template>
    </AppNumericInput>
  </div>
</template>

<script lang="ts" setup>
import { Ref, PropType } from 'vue'
import { formatPriceToAllowablePrice } from '@injectivelabs/sdk-ts'
import { UiPriceLevel } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { TradeField, TradeForm, UiMarketWithToken } from '@/types'
import {
  DEFAULT_MAX_PRICE_BAND_DIFFERENCE,
  DEFAULT_MIN_PRICE_BAND_DIFFERENCE
} from '@/app/utils/constants'

const derivativeStore = useDerivativeStore()
const spotStore = useSpotStore()
const formValues = useFormValues() as Ref<TradeForm>

const props = defineProps({
  isBuy: Boolean,
  isSpot: Boolean,
  isBaseAmount: Boolean,
  tradingTypeLimit: Boolean,
  tradingTypeStopLimit: Boolean,

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
  (e: 'update:amount', { isBaseAmount }: { isBaseAmount: boolean }): void
}>()

const { markPrice } = useDerivativeLastPrice(computed(() => props.market))
const { hasTriggerPrice, tradingTypeStopMarket } =
  useDerivativeFormFormatter(formValues)

const highestBuy = computed(() => {
  const buys = props.isSpot ? spotStore.buys : derivativeStore.buys

  const [buy] = buys || []

  return new BigNumberInWei(buy ? buy.price : 0).toBase(
    props.isSpot
      ? props.market.quoteToken.decimals - props.market.baseToken.decimals
      : props.market.quoteToken.decimals
  )
})

const lowestSell = computed(() => {
  const sells = props.isSpot ? spotStore.sells : derivativeStore.sells

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

const acceptableMax = computed(() => {
  const bandDifferenceFactor = DEFAULT_MAX_PRICE_BAND_DIFFERENCE.div(100)

  if (highestBuy.value.times(bandDifferenceFactor).lte(lowestSell.value)) {
    return highestBuy.value.times(bandDifferenceFactor)
  }

  return middlePrice.value.times(DEFAULT_MAX_PRICE_BAND_DIFFERENCE.div(100))
})

const cappedAcceptableMin = computed(() => {
  const bandMaxDifferenceFactor = DEFAULT_MAX_PRICE_BAND_DIFFERENCE.div(100)
  const bandMinDifferenceFactor = DEFAULT_MIN_PRICE_BAND_DIFFERENCE.div(100)
  const minTickPrice = new BigNumberInBase(
    new BigNumberInBase(1).shiftedBy(-props.market.priceDecimals)
  )

  if (highestBuy.value.times(bandMaxDifferenceFactor).lte(lowestSell.value)) {
    const acceptableMin = highestBuy.value.times(bandMinDifferenceFactor)

    return acceptableMin.gt(0) ? acceptableMin : minTickPrice
  }

  const acceptableMin = middlePrice.value.times(
    new BigNumberInBase(1).minus(bandMinDifferenceFactor)
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
      rules.push(`triggerPriceEqualsMarkPrice:${markPrice.value}`)
    }

    if (
      props.priceFieldName === TradeField.LimitPrice &&
      formValues.value[TradeField.PostOnly]
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
      new BigNumberInBase(formValues.value[TradeField.LimitPrice]).gt(0)
    ) {
      rules.push(
        `priceHighDeviationFromMidOrderbookPrice:${cappedAcceptableMin.value.toFixed()},${acceptableMax.value.toFixed()}`
      )
    }

    return rules.join('|')
  })
})

function recalculateBaseQuoteAmountValue() {
  formValues.value[TradeField.ProportionalPercentage] = 0

  emit('update:amount', { isBaseAmount: props.isBaseAmount })
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
    <AppInputNumeric
      v-model="price"
      v-bind="{
        placeholder: priceStep,
        step: priceStep,
        maxDecimals: market.priceDecimals
      }"
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
        <span>{{ market.quoteToken.symbol }}</span>
      </template>
    </AppInputNumeric>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import {
  UiSpotMarketWithToken,
  UiDerivativeMarketWithToken,
  MarketType
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, Status } from '@injectivelabs/utils'
import { UI_DEFAULT_MAX_NUMBER_OF_ORDERS } from '@/app/utils/constants'
import { amplitudeTracker } from '@/app/providers/AmplitudeTracker'
import { TradeField, TradeForm } from '@/types'
import { tradeErrorMessages } from '@/app/client/utils/validation/trade'

const walletStore = useWalletStore()
const { t } = useLang()
const { error } = useNotifications()

const props = defineProps({
  availableBalanceError: Boolean,
  hasBaseAmount: Boolean,
  hasTriggerPrice: Boolean,
  highDeviation: Boolean,
  initialMinMarginRequirementError: Boolean,
  isBuy: Boolean,
  markPriceThresholdError: Boolean,
  maxOrdersError: Boolean,
  orderTypeReduceOnly: Boolean,

  executionPrice: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  formErrors: {
    type: Object as PropType<Partial<Record<TradeField, string | undefined>>>,
    required: true
  },

  formValues: {
    type: Object as PropType<TradeForm>,
    required: true
  },

  market: {
    type: Object as PropType<
      UiSpotMarketWithToken | UiDerivativeMarketWithToken
    >,
    required: true
  },

  status: {
    type: Object as PropType<Status>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'submit:request'): void
  (e: 'form:submit'): void
}>()

const isSpot = props.market.type === MarketType.Spot

const hasError = computed(() => {
  if (
    !isSpot &&
    (props.initialMinMarginRequirementError || props.markPriceThresholdError)
  ) {
    return true
  }

  const filteredErrors = Object.keys(props.formErrors).filter(
    (key) => ![TradeField.SlippageTolerance].includes(key as TradeField)
  )

  return (
    filteredErrors.length > 0 ||
    props.availableBalanceError ||
    props.maxOrdersError
  )
})

const triggerPriceEqualsMarkPrice = computed(() =>
  Object.values(props.formErrors).includes(
    tradeErrorMessages.triggerPriceEqualsMarkPrice()
  )
)

const {
  isConditionalOrder,
  tradingTypeStopMarket,
  tradingTypeLimit: derivativeTradingTypeLimit,
  tradingTypeMarket: derivativeTradingTypeMarket
} = useDerivativeFormFormatter(computed(() => props.formValues))

const {
  tradingTypeLimit: spotTradingTypeLimit,
  tradingTypeMarket: spotTradingTypeMarket
} = useSpotFormFormatter(computed(() => props.formValues))

const tradingTypeLimit = isSpot
  ? spotTradingTypeLimit
  : derivativeTradingTypeLimit

const tradingTypeMarket = isSpot
  ? spotTradingTypeMarket
  : derivativeTradingTypeMarket

const disabled = computed(() => {
  const commonErrors =
    hasError.value ||
    !walletStore.isUserWalletConnected ||
    !walletStore.hasEnoughInjForGas ||
    !props.hasBaseAmount

  if (commonErrors) {
    return true
  }

  const isPerpConditionalOrderWithoutTriggerPrice =
    !isSpot && isConditionalOrder.value && !props.hasTriggerPrice

  if (isPerpConditionalOrderWithoutTriggerPrice) {
    return true
  }

  const isPerpConditionalOrderWithIncorrectTriggerPrice =
    !isSpot && isConditionalOrder.value && triggerPriceEqualsMarkPrice.value

  if (isPerpConditionalOrderWithIncorrectTriggerPrice) {
    return true
  }

  if (props.executionPrice.lte(0) && !tradingTypeStopMarket.value) {
    return true
  }

  return false
})

function onSubmit() {
  handleClickPlaceOrderTrack()

  if (!walletStore.isUserWalletConnected) {
    return error({ title: t('connect.pleaseConnectToYourWallet') })
  }

  if (hasError.value) {
    return error({ title: t('trade.error_in_form') })
  }

  if (props.maxOrdersError) {
    return error({
      title: t('trade.you_can_only_have_max_orders', {
        number: UI_DEFAULT_MAX_NUMBER_OF_ORDERS
      })
    })
  }

  emit('submit:request')
}

function handleClickPlaceOrderTrack() {
  const actualSlippageTolerance = tradingTypeMarket.value
    ? props.formValues[TradeField.SlippageTolerance]
    : ''

  amplitudeTracker.submitClickPlaceOrderTrackEvent({
    amount: props.formValues[TradeField.BaseAmount],
    leverage: props.formValues[TradeField.Leverage],
    orderType: props.formValues[TradeField.OrderType],
    reduceOnly: props.orderTypeReduceOnly,
    tradingType: props.formValues[TradeField.TradingType],
    triggerPrice: props.formValues[TradeField.TriggerPrice],
    limitPrice: props.formValues[TradeField.LimitPrice],
    market: props.market.slug,
    postOnly: tradingTypeLimit.value && props.formValues[TradeField.PostOnly],
    slippageTolerance: actualSlippageTolerance,
    marketType: props.market.subType
  })
}
</script>

<template>
  <div>
    <PartialsTradingFormOrderError
      v-bind="{
        highDeviation
      }"
    />

    <AppButton
      lg
      :status="status"
      :disabled="disabled"
      :class="{
        'hover:text-green-900 bg-green-500 text-green-800':
          !disabled && !hasError && isBuy,
        'hover:text-red-900 bg-red-500 text-red-800':
          !disabled && !hasError && !isBuy
      }"
      class="w-full rounded font-sembold shadow-none"
      data-cy="trading-page-execute-button"
      @click="onSubmit"
    >
      <span v-if="isSpot">{{
        isBuy ? $t('trade.buy') : $t('trade.sell')
      }}</span>
      <span v-else>{{
        isBuy ? t('trade.buyLong') : t('trade.sellShort')
      }}</span>
    </AppButton>
  </div>
</template>

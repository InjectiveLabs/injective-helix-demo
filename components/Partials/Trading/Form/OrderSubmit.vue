<script lang="ts" setup>
import { PropType, Ref } from 'vue'
import {
  UiSpotMarketWithToken,
  UiDerivativeMarketWithToken,
  MarketType
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, Status } from '@injectivelabs/utils'
import { amplitudeTradeTracker } from '@/app/providers/amplitude'
import { tradeErrorMessages } from '@/app/client/utils/validation/trade'
import { Modal, TradeField, TradeForm } from '@/types'

const accountStore = useAccountStore()
const modalStore = useModalStore()
const walletStore = useWalletStore()
const formValues = useFormValues() as Ref<TradeForm>
const formErrors = useFormErrors()
const { t } = useLang()
const { error } = useNotifications()

const props = defineProps({
  isBuy: Boolean,
  hasBaseAmount: Boolean,
  highDeviation: Boolean,
  maxOrdersError: Boolean,
  hasTriggerPrice: Boolean,
  orderTypeReduceOnly: Boolean,
  availableBalanceError: Boolean,
  markPriceThresholdError: Boolean,
  initialMinMarginRequirementError: Boolean,

  executionPrice: {
    type: Object as PropType<BigNumberInBase>,
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

  const filteredErrors = Object.keys(formErrors.value).filter(
    (key) => ![TradeField.SlippageTolerance].includes(key as TradeField)
  )

  return (
    filteredErrors.length > 0 ||
    props.availableBalanceError ||
    props.maxOrdersError
  )
})

const triggerPriceEqualsMarkPrice = computed(() =>
  Object.values(formErrors.value).includes(
    tradeErrorMessages.triggerPriceEqualsMarkPrice()
  )
)

const {
  isConditionalOrder,
  tradingTypeStopMarket,
  tradingTypeLimit: derivativeTradingTypeLimit,
  tradingTypeMarket: derivativeTradingTypeMarket
} = useDerivativeFormFormatter(formValues)

const {
  tradingTypeLimit: spotTradingTypeLimit,
  tradingTypeMarket: spotTradingTypeMarket
} = useSpotFormFormatter(formValues)

const tradingTypeLimit = isSpot
  ? spotTradingTypeLimit
  : derivativeTradingTypeLimit

const tradingTypeMarket = isSpot
  ? spotTradingTypeMarket
  : derivativeTradingTypeMarket

const disabled = computed(() => {
  const commonErrors =
    hasError.value ||
    !props.hasBaseAmount ||
    !accountStore.hasEnoughInjForGas ||
    !walletStore.isUserWalletConnected

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

function handleSubmit() {
  trackPlaceOrder()

  if (!walletStore.isUserWalletConnected) {
    return error({ title: t('connect.pleaseConnectToYourWallet') })
  }

  if (hasError.value) {
    return error({ title: t('trade.error_in_form') })
  }

  emit('submit:request')
}

function trackPlaceOrder() {
  const actualSlippageTolerance = tradingTypeMarket.value
    ? formValues.value[TradeField.SlippageTolerance]
    : ''

  amplitudeTradeTracker.submitPlaceOrderAttemptTrackEvent({
    market: props.market.slug,
    marketType: props.market.subType,
    reduceOnly: props.orderTypeReduceOnly,
    slippageTolerance: actualSlippageTolerance,
    amount: formValues.value[TradeField.BaseAmount],
    leverage: formValues.value[TradeField.Leverage],
    orderType: formValues.value[TradeField.OrderSide],
    limitPrice: formValues.value[TradeField.LimitPrice],
    tradingType: formValues.value[TradeField.TradingType],
    triggerPrice: formValues.value[TradeField.TriggerPrice],
    postOnly: tradingTypeLimit.value && formValues.value[TradeField.PostOnly]
  })
}

function handleConnect() {
  modalStore.openModal({ type: Modal.Connect })
}
</script>

<template>
  <div>
    <PartialsTradingFormOrderError
      v-bind="{
        highDeviation,
        maxOrdersError
      }"
    />

    <AppButton
      v-if="!walletStore.isUserWalletConnected"
      lg
      class="bg-blue-500 text-blue-900 font-semibold w-full"
      @click="handleConnect"
    >
      <span>{{ $t('connect.connect') }}</span>
    </AppButton>

    <AppButton
      v-else
      lg
      :status="status"
      :disabled="disabled"
      :class="{
        'hover:text-green-900 bg-green-500 text-green-800':
          !disabled && !hasError && isBuy,
        'hover:text-red-900 bg-red-500 text-red-800':
          !disabled && !hasError && !isBuy
      }"
      class="w-full font-sembold shadow-none"
      data-cy="trading-page-execute-button"
      @click="handleSubmit"
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

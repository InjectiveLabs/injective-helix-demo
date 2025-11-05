<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import { calculateLiquidationPrice } from '@/app/client/utils/derivatives'
import {
  Modal,
  MarketKey,
  BusEvents,
  TradeAmountOption,
  DerivativeTradeTypes,
  PerpetualMarketCyTags,
  DerivativesTradeFormField
} from '@/types'
import type { PositionV2 } from '@injectivelabs/sdk-ts'
import type { UiDerivativeMarket, DerivativesTradeForm } from '@/types'
import { BigNumberInBase } from '@injectivelabs/utils'

const appStore = useAppStore()
const modalStore = useSharedModalStore()

const { setValues: setFormValues } = useForm<DerivativesTradeForm>()
const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const market = inject(MarketKey) as Ref<UiDerivativeMarket>

const selectedPosition = ref<undefined | PositionV2>(undefined)

const { value: orderType } = useStringField({
  name: DerivativesTradeFormField.Type,
  initialValue: DerivativeTradeTypes.Limit
})
const { value: orderSide } = useStringField({
  name: DerivativesTradeFormField.Side,
  initialValue: TradeDirection.Long
})

const isLimitOrder = computed(
  () =>
    derivativeFormValues.value[DerivativesTradeFormField.Type] ===
      DerivativeTradeTypes.Limit ||
    derivativeFormValues.value[DerivativesTradeFormField.Type] ===
      DerivativeTradeTypes.StopLimit
)

const isTriggerOrder = computed(() =>
  [DerivativeTradeTypes.StopLimit, DerivativeTradeTypes.StopMarket].includes(
    derivativeFormValues.value[
      DerivativesTradeFormField.Type
    ] as DerivativeTradeTypes
  )
)

const { lastTradedPrice } = useDerivativeLastPrice(computed(() => market.value))

const { takerFeeRate } = useTradeFee({
  marketTakerFeeRate: market.value.takerFeeRate,
  marketMakerFeeRate: market.value.makerFeeRate
})

const tradeDetails = useTradeDetails({
  isLimitOrder,
  takerFeeRate,
  isTriggerOrder,
  market: computed(() => market.value),
  limitPrice: computed(
    () =>
      derivativeFormValues.value[DerivativesTradeFormField.LimitPrice] || '0'
  ),
  isPostOnly: computed(
    () =>
      derivativeFormValues.value[DerivativesTradeFormField.PostOnly] || false
  ),
  triggerPrice: computed(
    () =>
      derivativeFormValues.value[DerivativesTradeFormField.TriggerPrice] || '0'
  ),
  leverage: computed(
    () => derivativeFormValues.value[DerivativesTradeFormField.Leverage] || '1'
  ),
  slippagePercentage: computed(
    () => derivativeFormValues.value[DerivativesTradeFormField.Slippage] || '0'
  ),
  isBuy: computed(
    () =>
      derivativeFormValues.value[DerivativesTradeFormField.Side] ===
      TradeDirection.Long
  )
})

const isReady = ref(false)

const quantityToBigNumber = computed(
  () => new BigNumberInBase(tradeDetails.quantity.value)
)

const feeAmountToBigNumber = computed(
  () => new BigNumberInBase(tradeDetails.feeAmount.value)
)

const totalNotionalToBigNumber = computed(
  () => new BigNumberInBase(tradeDetails.notionalWithFee.value)
)

const estLiquidationPrice = computed(() => {
  const isBuy =
    derivativeFormValues.value[DerivativesTradeFormField.Side] ===
    TradeDirection.Long

  return calculateLiquidationPrice({
    market: market.value,
    quantity: tradeDetails.quantity.value,
    orderType: isBuy ? OrderSide.Buy : OrderSide.Sell,
    price: tradeDetails.executionPrice.value.toFixed(),
    notionalWithLeverage: tradeDetails.margin.value.toFixed()
  })
})

onMounted(() => {
  isReady.value = true

  setFormValues(
    {
      [DerivativesTradeFormField.Slippage]: appStore.slippageByMarketId(
        market.value.marketId
      )
    },
    false
  )
})

function addTpSl(position: PositionV2) {
  selectedPosition.value = position
  modalStore.openModal(Modal.AddTakeProfitStopLoss)
}

function onTradeTypeChange() {
  if (orderType.value !== DerivativeTradeTypes.StopLimit) {
    return
  }

  setFormValues(
    {
      [DerivativesTradeFormField.LimitPrice]: ''
    },
    false
  )
}

function resetSelectedPosition() {
  selectedPosition.value = undefined
}

function openLeverageModal() {
  modalStore.openModal(Modal.Leverage)
}

watch(
  [() => derivativeFormValues.value],
  ([formValues]) => {
    const option =
      formValues[DerivativesTradeFormField.AmountOption] ||
      TradeAmountOption.Base

    if (option === TradeAmountOption.Base) {
      tradeDetails.quantity.value =
        formValues[DerivativesTradeFormField.Amount] || '0'
    } else {
      tradeDetails.notional.value =
        formValues[DerivativesTradeFormField.Amount] || '0'
    }
  },
  { deep: true }
)
</script>

<template>
  <div class="p-4 lg:pb-8">
    <PartialsTradeFuturesFormStandardNavigation
      v-model="orderType"
      @trade-type:change="onTradeTypeChange"
    />

    <PartialsTradeCommonFormSideSelector
      v-model="orderSide"
      class="mt-4"
      v-bind="{
        isLimitOrder
      }"
    />

    <div class="space-y-4 pt-4">
      <AppButton
        is-full-width
        variant="primary-outline"
        class="rounded-lg p-2.5 w-full text-sm font-medium"
        @click="openLeverageModal"
      >
        {{
          $t('trade.leverageModal.leverageAt', {
            leverageAmount:
              derivativeFormValues[DerivativesTradeFormField.Leverage]
          })
        }}
      </AppButton>

      <PartialsTradeFuturesFormStandardTriggerField v-if="isTriggerOrder" />

      <PartialsTradeCommonFormLimitPriceField
        v-if="isLimitOrder"
        v-bind="{
          isBuySide: orderSide === TradeDirection.Long,
          fieldName: DerivativesTradeFormField.LimitPrice,
          cyTag: PerpetualMarketCyTags.LimitpriceInputField,
          lastTradedPrice,
          shouldSkipAutoSet: orderType === DerivativeTradeTypes.StopLimit,
          bypassPriceWarning:
            derivativeFormValues[DerivativesTradeFormField.BypassPriceWarning]
        }"
      />

      <PartialsTradeFuturesFormStandardAmountField
        v-bind="{
          isLimitOrder,
          quantity: quantityToBigNumber,
          worstPrice: tradeDetails.executionPrice.value,
          marginWithFee: tradeDetails.marginWithFee.value,
          minimumAmountInQuote: tradeDetails.minimumAmountInQuote.value
        }"
      />
    </div>

    <PartialsTradeFuturesFormStandardAdvancedSettings
      class="mt-4"
      v-bind="{
        isLimitOrder,
        estLiquidationPrice
      }"
      @tpsl:add="addTpSl"
    />

    <PartialsTradeFuturesFormStandardDetails
      v-if="isReady"
      v-bind="{
        tradeDetails,
        isLimitOrder,
        isTriggerOrder,
        estLiquidationPrice
      }"
    />

    <PartialsTradeFuturesFormStandardCreateOrder
      v-bind="{
        isLimitOrder,
        isTriggerOrder,
        quantity: quantityToBigNumber,
        feeAmount: feeAmountToBigNumber,
        margin: tradeDetails.margin.value,
        totalNotional: totalNotionalToBigNumber,
        feePercentage: tradeDetails.feeRate.value,
        worstPrice: tradeDetails.executionPrice.value,
        marginWithFee: tradeDetails.marginWithFee.value,
        hasEnoughLiquidity: tradeDetails.enoughLiquidity.value,
        hasSlippageWarning: tradeDetails.hasSlippageWarning.value
      }"
    />

    <PartialsTradeCommonFormAccountEquity />

    <ModalsAddTakeProfitStopLoss
      v-if="selectedPosition"
      v-bind="{ position: selectedPosition }"
      @on:close="resetSelectedPosition"
    />

    <ModalsLeverage
      v-bind="{ worstPrice: tradeDetails.executionPrice.value }"
    />
  </div>
</template>

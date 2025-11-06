<script setup lang="ts">
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import { calculateLiquidationPrice } from '@/app/client/utils/derivatives'
import {
  Modal,
  MarketKey,
  TradeAmountOption,
  DerivativeTradeTypes,
  DerivativesTradeFormField
} from '@/types'
import type { PositionV2 } from '@injectivelabs/sdk-ts'
import type { UiDerivativeMarket, DerivativesTradeForm } from '@/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_LEVERAGE } from '@/app/utils/constants'

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

const isMarketOrder = computed(() =>
  [DerivativeTradeTypes.Market].includes(
    derivativeFormValues.value[
      DerivativesTradeFormField.Type
    ] as DerivativeTradeTypes
  )
)

const isLimitOrder = computed(() =>
  [DerivativeTradeTypes.Limit, DerivativeTradeTypes.StopLimit].includes(
    derivativeFormValues.value[
      DerivativesTradeFormField.Type
    ] as DerivativeTradeTypes
  )
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

const isBuy = computed(
  () =>
    derivativeFormValues.value[DerivativesTradeFormField.Side] ===
    TradeDirection.Long
)

const tradeDetails = useTradeDetails({
  isBuy,
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
    () =>
      derivativeFormValues.value[DerivativesTradeFormField.Leverage] ||
      UI_DEFAULT_LEVERAGE
  ),
  slippagePercentage: computed(
    () => derivativeFormValues.value[DerivativesTradeFormField.Slippage] || '0'
  )
})

const isReady = ref(false)

const limitPriceShouldSkipAutoSet = computed(
  () => orderType.value === DerivativeTradeTypes.StopLimit
)

const bypassPriceWarning = computed(
  () => derivativeFormValues.value[DerivativesTradeFormField.BypassPriceWarning]
)

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
  return calculateLiquidationPrice({
    market: market.value,
    quantity: tradeDetails.quantity.value,
    price: tradeDetails.executionPrice.value.toFixed(),
    orderType: isBuy.value ? OrderSide.Buy : OrderSide.Sell,
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
  <div class="space-y-4 p-4 lg:pb-8">
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
        isBuy,
        lastTradedPrice,
        bypassPriceWarning,
        shouldSkipAutoSet: limitPriceShouldSkipAutoSet,
        fieldName: DerivativesTradeFormField.LimitPrice
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

    <PartialsTradeFuturesFormStandardAdvancedSettings
      v-bind="{
        isLimitOrder,
        isMarketOrder,
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

    <PartialsTradeCommonFormAccountEquity class="!mt-6" />

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

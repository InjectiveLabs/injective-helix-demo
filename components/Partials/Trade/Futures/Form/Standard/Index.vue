<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import { calculateLiquidationPrice } from '@/app/client/utils/derivatives'
import {
  Modal,
  MarketKey,
  BusEvents,
  DerivativeTradeTypes,
  PerpetualMarketCyTags,
  DerivativesTradeFormField,
  TradeAmountOption
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

const { takerFeeRate } = useTradeFee({
  marketTakerFeeRate: market.value.takerFeeRate,
  marketMakerFeeRate: market.value.makerFeeRate
})

const derivativeDetails = useDerivativeDetails({
  isLimitOrder,
  takerFeeRate,
  isTriggerOrder,
  market: computed(() => market.value),
  limitPrice: computed(
    () =>
      derivativeFormValues.value[DerivativesTradeFormField.LimitPrice] || '0'
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
  isPostOnly: computed(
    () =>
      derivativeFormValues.value[DerivativesTradeFormField.PostOnly] || false
  ),
  isBuy: computed(
    () =>
      derivativeFormValues.value[DerivativesTradeFormField.Side] ===
      TradeDirection.Long
  )
})

const isReady = ref(false)

const quantityToBigNumber = computed(
  () => new BigNumberInBase(derivativeDetails.quantity.value)
)

const feeAmountToBigNumber = computed(
  () => new BigNumberInBase(derivativeDetails.feeAmount.value)
)

const totalNotionalToBigNumber = computed(
  () => new BigNumberInBase(derivativeDetails.totalNotional.value)
)

const estLiquidationPrice = computed(() => {
  const isBuy =
    derivativeFormValues.value[DerivativesTradeFormField.Side] ===
    TradeDirection.Long

  return calculateLiquidationPrice({
    market: market.value,
    quantity: derivativeDetails.quantity.value,
    orderType: isBuy ? OrderSide.Buy : OrderSide.Sell,
    price: derivativeDetails.executionPrice.value.toFixed(),
    notionalWithLeverage: derivativeDetails.margin.value.toFixed()
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

function onOrderSideChange() {
  if (
    ![DerivativeTradeTypes.Limit, DerivativeTradeTypes.StopLimit].includes(
      orderType.value as DerivativeTradeTypes
    )
  ) {
    return
  }

  useEventBus(BusEvents.OrderSideToggled).emit()
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
      derivativeDetails.quantity.value =
        formValues[DerivativesTradeFormField.Amount] || '0'
    } else {
      derivativeDetails.notional.value =
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

    <div class="flex mt-4 bg-brand-875 rounded-md">
      <AppButtonSelect
        v-for="side in [TradeDirection.Long, TradeDirection.Short]"
        :key="side"
        v-bind="{ value: side }"
        v-model="orderSide"
        class="flex-1"
        :data-cy="`${dataCyTag(PerpetualMarketCyTags.TradeDirection)}-${side}`"
        @click="onOrderSideChange"
      >
        <AppButton
          :variant="
            orderSide === side
              ? side === TradeDirection.Long
                ? 'success'
                : 'danger'
              : side === TradeDirection.Long
                ? 'success-cta'
                : 'danger-cta'
          "
          :class="[
            'w-full py-2 leading-relaxed focus-within:ring-0',
            side === TradeDirection.Long ? 'hover:bg-green-500' : ''
          ]"
        >
          <span>
            {{ $t(`trade.${side === TradeDirection.Long ? 'buy' : 'sell'}`) }}
            /
            {{ $t(`trade.${side === TradeDirection.Long ? 'long' : 'short'}`) }}
          </span>
        </AppButton>
      </AppButtonSelect>
    </div>

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

      <PartialsTradeFuturesFormStandardTriggerField
        v-if="
          [
            DerivativeTradeTypes.StopLimit,
            DerivativeTradeTypes.StopMarket
          ].includes(orderType as DerivativeTradeTypes)
        "
      />

      <PartialsTradeFuturesFormStandardLimitPriceField
        v-if="
          [DerivativeTradeTypes.StopLimit, DerivativeTradeTypes.Limit].includes(
            orderType as DerivativeTradeTypes
          )
        "
      />

      <PartialsTradeFuturesFormStandardAmountField
        v-bind="{
          quantity: quantityToBigNumber,
          worstPrice: derivativeDetails.executionPrice.value,
          marginWithFee: derivativeDetails.marginWithFee.value,
          minimumAmountInQuote: derivativeDetails.minimumAmountInQuote.value,
          isNotionalLessThanMinNotional:
            derivativeDetails.isNotionalLessThanMinNotional.value ?? false
        }"
      />
    </div>

    <PartialsTradeFuturesFormStandardAdvancedSettings
      class="mt-4"
      v-bind="{ estLiquidationPrice }"
      @tpsl:add="addTpSl"
    />

    <PartialsTradeFuturesFormStandardDetails
      v-if="isReady"
      v-bind="{
        estLiquidationPrice,
        margin: derivativeDetails.margin.value,
        quantity: derivativeDetails.quantity.value,
        notional: derivativeDetails.notional.value,
        feeAmount: derivativeDetails.feeAmount.value,
        bestPrice: derivativeDetails.bestPrice.value,
        executionPrice: derivativeDetails.executionPrice.value,
        worstPrice: derivativeDetails.worstPrice.value,
        averagePrice: derivativeDetails.averagePrice.value,
        marginWithFee: derivativeDetails.marginWithFee.value,
        totalNotional: derivativeDetails.totalNotional.value,
        slippagePrice: derivativeDetails.slippagePrice.value,
        enoughLiquidity: derivativeDetails.enoughLiquidity.value,
        slippageWarning: derivativeDetails.slippageWarning.value,
        calculatedNotional: derivativeDetails.calculatedNotional.value,
        minimumAmountInQuote: derivativeDetails.minimumAmountInQuote.value,
        estSlippagePercentage: derivativeDetails.estSlippagePercentage.value,
        isNotionalLessThanMinNotional:
          derivativeDetails.isNotionalLessThanMinNotional.value ?? false
      }"
    />

    <PartialsTradeFuturesFormStandardCreateOrder
      v-bind="{
        quantity: quantityToBigNumber,
        feeAmount: feeAmountToBigNumber,
        margin: derivativeDetails.margin.value,
        totalNotional: totalNotionalToBigNumber,
        worstPrice: derivativeDetails.executionPrice.value,
        feePercentage: derivativeDetails.feePercentage.value,
        marginWithFee: derivativeDetails.marginWithFee.value,
        hasEnoughLiquidity: derivativeDetails.enoughLiquidity.value,
        hasSlippageWarning: derivativeDetails.slippageWarning.value,
        isNotionalLessThanMinNotional:
          derivativeDetails.isNotionalLessThanMinNotional.value ?? false
      }"
    />

    <PartialsTradeCommonFormAccountEquity />

    <ModalsAddTakeProfitStopLoss
      v-if="selectedPosition"
      v-bind="{ position: selectedPosition }"
      @on:close="resetSelectedPosition"
    />

    <ModalsLeverage
      v-bind="{ worstPrice: derivativeDetails.executionPrice.value }"
    />
  </div>
</template>

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
  DerivativesTradeFormField
} from '@/types'
import type { PositionV2 } from '@injectivelabs/sdk-ts'
import type { UiDerivativeMarket, DerivativesTradeForm } from '@/types'

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

const {
  margin,
  quantity,
  feeAmount,
  worstPrice,
  feePercentage,
  marginWithFee,
  totalNotional,
  minimumAmountInQuote
} = useDerivativeWorstPrice(market)

const estLiquidationPrice = computed(() => {
  const isBuy =
    derivativeFormValues.value[DerivativesTradeFormField.Side] ===
    TradeDirection.Long

  return calculateLiquidationPrice({
    price: worstPrice.value.toFixed(),
    quantity: quantity.value.toFixed(),
    notionalWithLeverage: margin.value.toFixed(),
    orderType: isBuy ? OrderSide.Buy : OrderSide.Sell,
    market: market.value
  })
})

onMounted(() => {
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
</script>

<template>
  <div class="p-4 lg:pb-8">
    <div class="border-b">
      <AppButtonSelect
        v-for="value in Object.values(DerivativeTradeTypes)"
        :key="value"
        v-bind="{ value }"
        v-model="orderType"
        class="text-xs font-medium capitalize px-3 py-2 text-coolGray-400"
        active-classes="border-b border-blue-550 text-white"
        :data-cy="`${dataCyTag(
          PerpetualMarketCyTags.DerivativeTradeType
        )}-${value}`"
        @click="onTradeTypeChange"
      >
        {{ $t(`trade.${value}`) }}
      </AppButtonSelect>
    </div>

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
            'w-full py-1.5 leading-relaxed focus-within:ring-0',
            side === TradeDirection.Long ? 'hover:bg-green-500' : ''
          ]"
        >
          <span>
            {{ $t(`trade.${side === TradeDirection.Long ? 'buy' : 'sell'}`) }}
          </span>
        </AppButton>
      </AppButtonSelect>
    </div>

    <div class="space-y-4 pt-4">
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
        v-bind="{ marginWithFee, quantity, minimumAmountInQuote, worstPrice }"
      />

      <PartialsTradeFuturesFormStandardLeverage v-bind="{ worstPrice }" />
    </div>

    <PartialsTradeFuturesFormStandardSlippage
      v-if="
        [DerivativeTradeTypes.Market, DerivativeTradeTypes.StopMarket].includes(
          derivativeFormValues[
            DerivativesTradeFormField.Type
          ] as DerivativeTradeTypes
        )
      "
      v-bind="{ worstPrice }"
      class="mt-4"
    />

    <PartialsTradeFuturesFormStandardAdvancedSettings
      class="mt-4"
      v-bind="{ estLiquidationPrice }"
      @tpsl:add="addTpSl"
    />

    <PartialsTradeFuturesFormStandardDetails
      v-bind="{
        margin,
        quantity,
        feeAmount,
        worstPrice,
        marginWithFee,
        totalNotional,
        estLiquidationPrice
      }"
    />

    <PartialsTradeFuturesFormStandardCreateOrder
      v-bind="{
        margin,
        quantity,
        feeAmount,
        worstPrice,
        feePercentage,
        marginWithFee,
        totalNotional
      }"
    />

    <PartialsTradeCommonFormAccountEquity />

    <ModalsAddTakeProfitStopLoss
      v-if="selectedPosition"
      v-bind="{ position: selectedPosition }"
      @on:close="resetSelectedPosition"
    />
  </div>
</template>

<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { OrderSide } from '@injectivelabs/ts-types'
import {
  MainPage,
  BusEvents,
  MarketKey,
  TradeTypes,
  SpotMarketCyTags,
  SpotTradeFormField,
  TradeAmountOption
} from '@/types'
import type { UiSpotMarket, SpotTradeForm } from '@/types'
import { BigNumberInBase } from '@injectivelabs/utils'

const appStore = useAppStore()
const swapStore = useSwapStore()

const { setValues: setFormValues } = useForm<SpotTradeForm>()
const spotFormValues = useFormValues<SpotTradeForm>()

const market = inject(MarketKey) as Ref<UiSpotMarket>

const { value: orderTypeValue } = useStringField({
  name: SpotTradeFormField.Type,
  initialValue: TradeTypes.Limit
})

const { value: orderSideValue } = useStringField({
  name: SpotTradeFormField.Side,
  initialValue: OrderSide.Buy
})

const { takerFeeRate } = useTradeFee({
  marketTakerFeeRate: market?.value?.takerFeeRate,
  marketMakerFeeRate: market?.value?.makerFeeRate
})

const isLimitOrder = computed(
  () => spotFormValues.value[SpotTradeFormField.Type] === TradeTypes.Limit
)

const spotDetails = useSpotDetails({
  isLimitOrder,
  takerFeeRate,
  market: computed(() => market.value),
  limitPrice: computed(
    () => spotFormValues.value[SpotTradeFormField.Price] || '0'
  ),
  slippagePercentage: computed(
    () => spotFormValues.value[SpotTradeFormField.Slippage] || '0'
  ),
  isPostOnly: computed(
    () => spotFormValues.value[SpotTradeFormField.PostOnly] || false
  ),
  isBuy: computed(
    () => spotFormValues.value[SpotTradeFormField.Side] === OrderSide.Buy
  )
})

const quantityToBigNumber = computed(
  () => new BigNumberInBase(spotDetails.quantity.value)
)

const totalWithFeeToBigNumber = computed(
  () => new BigNumberInBase(spotDetails.totalNotional.value)
)

const isSwapEnabled = computed(() =>
  swapStore.routes.some(
    (route) =>
      (route.targetDenom === market.value.baseDenom &&
        route.sourceDenom === market.value.quoteDenom) ||
      (route.targetDenom === market.value.quoteDenom &&
        route.sourceDenom === market.value.baseDenom)
  )
)

onMounted(() => {
  setFormValues(
    {
      [SpotTradeFormField.Slippage]: appStore.slippageByMarketId(
        market.value.marketId
      )
    },
    false
  )
})

function onOrderSideClicked() {
  if (orderTypeValue.value !== TradeTypes.Limit) {
    return
  }

  useEventBus(BusEvents.OrderSideToggled).emit()
}

watch(
  [() => spotFormValues.value],
  ([formValues]) => {
    const option =
      formValues[SpotTradeFormField.AmountOption] || TradeAmountOption.Base
    const amount = formValues[SpotTradeFormField.Amount] || '0'

    if (option === TradeAmountOption.Base) {
      spotDetails.quantity.value = amount
    } else {
      spotDetails.notional.value = amount
    }
  },
  { deep: true }
)
</script>

<template>
  <div class="p-4 lg:pb-8">
    <div
      class="border-b max-lg:-mx-4 max-lg:-mt-2"
      :data-cy="dataCyTag(SpotMarketCyTags.SpotTradingType)"
    >
      <div class="flex items-center">
        <AppButtonSelect
          v-for="value in Object.values(TradeTypes)"
          :key="value"
          v-bind="{ value }"
          v-model="orderTypeValue"
          class="flex-1 text-xs font-medium text-coolGray-450 px-4 py-2 hover:text-white"
          active-classes="border-b border-blue-550 text-white"
        >
          {{ $t(`trade.${value}`) }}
        </AppButtonSelect>

        <NuxtLink
          v-if="isSwapEnabled"
          :to="{
            name: MainPage.Swap,
            query: {
              to: market.baseDenom,
              from: market.quoteDenom
            }
          }"
          class="flex-1 text-center text-xs font-medium text-coolGray-450 px-4 py-2 hover:text-white"
        >
          {{ $t(`navigation.swap`) }}
        </NuxtLink>
      </div>
    </div>

    <div class="flex mt-4 bg-brand-875 rounded-md">
      <AppButtonSelect
        v-for="side in [OrderSide.Buy, OrderSide.Sell]"
        :key="side"
        v-bind="{ value: side }"
        v-model="orderSideValue"
        class="flex-1"
        :data-cy="`${dataCyTag(SpotMarketCyTags.SpotTradingSide)}-${side}`"
        @click="onOrderSideClicked"
      >
        <AppButton
          class="w-full py-2 leading-relaxed focus-within:ring-0"
          :variant="
            side === orderSideValue
              ? side === OrderSide.Buy
                ? 'success'
                : 'danger'
              : side === OrderSide.Buy
                ? 'success-cta'
                : 'danger-cta'
          "
        >
          {{ $t(`trade.${side}`) }}
        </AppButton>
      </AppButtonSelect>
    </div>

    <div class="pt-4 space-y-4">
      <PartialsTradeSpotFormStandardLimitPriceField
        v-if="orderTypeValue === TradeTypes.Limit"
      />

      <PartialsTradeSpotFormStandardAmountField
        v-bind="{
          quantity: quantityToBigNumber,
          totalWithFee: totalWithFeeToBigNumber,
          minimumAmountInQuote: spotDetails.minimumAmountInQuote.value,
          isNotionalLessThanMinNotional:
            spotDetails.isNotionalLessThanMinNotional.value ?? false
        }"
      />
    </div>

    <PartialsTradeSpotFormStandardAdvancedSettings
      v-if="isLimitOrder"
      class="mt-4"
    />

    <PartialsTradeSpotFormStandardDetails
      class="my-4"
      v-bind="{
        spotDetails,
        isLimitOrder
      }"
    />

    <PartialsTradeSpotFormStandardCreateOrder
      v-bind="{
        isLimitOrder,
        quantity: quantityToBigNumber,
        worstPrice: spotDetails.executionPrice.value,
        hasEnoughLiquidity: spotDetails.enoughLiquidity.value,
        hasSlippageWarning: spotDetails.slippageWarning.value,
        isNotionalLessThanMinNotional:
          spotDetails.isNotionalLessThanMinNotional.value ?? false
      }"
    />

    <PartialsTradeCommonFormAccountEquity />
  </div>
</template>

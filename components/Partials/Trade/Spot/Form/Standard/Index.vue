<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { OrderSide } from '@injectivelabs/ts-types'
import {
  MainPage,
  MarketKey,
  TradeTypes,
  SpotMarketCyTags,
  TradeAmountOption,
  SpotTradeFormField
} from '@/types'
import type { UiSpotMarket, SpotTradeForm } from '@/types'

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

const { lastTradedPrice } = useSpotLastPrice(computed(() => market.value))

const isLimitOrder = computed(
  () => spotFormValues.value[SpotTradeFormField.Type] === TradeTypes.Limit
)

const isBuy = computed(
  () => spotFormValues.value[SpotTradeFormField.Side] === OrderSide.Buy
)

const tradeDetails = useTradeDetails({
  isBuy,
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
  )
})

const quantityToBigNumber = computed(
  () => new BigNumberInBase(tradeDetails.quantity.value)
)

const totalWithFeeToBigNumber = computed(
  () => new BigNumberInBase(tradeDetails.notionalWithFee.value)
)

const bypassPriceWarning = computed(
  () => spotFormValues.value[SpotTradeFormField.BypassPriceWarning]
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

watch(
  [() => spotFormValues.value],
  ([formValues]) => {
    const amount = formValues[SpotTradeFormField.Amount] || '0'
    const option =
      formValues[SpotTradeFormField.AmountOption] || TradeAmountOption.Base

    if (option === TradeAmountOption.Base) {
      tradeDetails.quantity.value = amount

      return
    }

    tradeDetails.notional.value = amount
  },
  { deep: true }
)
</script>

<template>
  <div class="space-y-4 p-4 lg:pb-8">
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

    <PartialsTradeCommonFormSideSelector
      v-model="orderSideValue"
      v-bind="{ isLimitOrder }"
    />

    <PartialsTradeCommonFormLimitPriceField
      v-if="isLimitOrder"
      v-bind="{
        isBuy,
        lastTradedPrice,
        bypassPriceWarning,
        fieldName: SpotTradeFormField.Price
      }"
    />

    <PartialsTradeSpotFormStandardAmountField
      v-bind="{
        quantity: quantityToBigNumber,
        totalWithFee: totalWithFeeToBigNumber,
        minimumAmountInQuote: tradeDetails.minimumAmountInQuote.value
      }"
    />

    <PartialsTradeSpotFormStandardAdvancedSettings v-if="isLimitOrder" />

    <PartialsTradeSpotFormStandardDetails
      v-bind="{
        tradeDetails,
        isLimitOrder
      }"
    />

    <PartialsTradeSpotFormStandardCreateOrder
      v-bind="{
        isLimitOrder,
        quantity: quantityToBigNumber,
        worstPrice: tradeDetails.executionPrice.value,
        hasEnoughLiquidity: tradeDetails.enoughLiquidity.value,
        hasSlippageWarning: tradeDetails.hasSlippageWarning.value
      }"
    />

    <PartialsTradeCommonFormAccountEquity class="!mt-6" />
  </div>
</template>

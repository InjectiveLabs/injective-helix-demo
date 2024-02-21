<script lang="ts" setup>
import { PropType, Ref } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE, MarketType } from '@injectivelabs/sdk-ui-ts'
import { QUOTE_DENOMS_TO_SHOW_USD_VALUE } from '@/app/data/market'
import { TRADE_FORM_PRICE_ROUNDING_MODE } from '@/app/utils/constants'
import { TradeField, TradeForm, UiMarketWithToken } from '@/types'

const tokenStore = useTokenStore()
const formValues = useFormValues() as Ref<TradeForm>

const props = defineProps({
  isBuy: Boolean,
  isOrderTypeReduceOnly: Boolean,

  executionPrice: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  fees: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  feeRate: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  liquidationPrice: {
    type: Object as PropType<BigNumberInBase> | undefined,
    default: undefined
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  notionalValue: {
    type: Object as PropType<BigNumberInBase>,
    default: undefined
  },

  notionalWithFees: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  slippage: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const isSpot = props.market.type === MarketType.Spot

const {
  baseAmount: derivativeBaseAmount,
  quoteAmount: derivativeQuoteAmount,
  tradingTypeLimit: derivativeTradingTypeLimit,
  tradingTypeMarket: derivativeTradingTypeMarket
} = useDerivativeFormFormatter(formValues)

const {
  baseAmount: spotBaseAmount,
  quoteAmount: spotQuoteAmount,
  tradingTypeLimit: spotTradingTypeLimit,
  tradingTypeMarket: spotTradingTypeMarket
} = useSpotFormFormatter(formValues)

const tradingTypeLimit = isSpot
  ? spotTradingTypeLimit
  : derivativeTradingTypeLimit
const tradingTypeMarket = isSpot
  ? spotTradingTypeMarket
  : derivativeTradingTypeMarket

const orderDetailsComponentPath = computed(() => {
  const componentName =
    tradingTypeMarket.value || tradingTypeLimit.value || isSpot
      ? 'OrderDetails'
      : 'ConditionalOrderDetails'

  const spotPath = `Spot/Trading/${componentName}`
  const derivativePath = `Derivatives/Trading/${componentName}`

  return isSpot ? spotPath : derivativePath
})

const orderDetailsComponent = defineAsyncComponent<Record<string, unknown>>(
  () => {
    return new Promise((resolve, _reject) => {
      const comps = import.meta.glob(/* @vite-ignore */ './../**/*.vue')

      return comps[
        /* @vite-ignore */ `../${orderDetailsComponentPath.value}.vue`
      ]().then((component: any) => resolve(component.default))
    })
  }
)

const { valueToString: executionPriceToFormat } = useBigNumberFormatter(
  computed(() => props.executionPrice),
  {
    decimalPlaces: props.market.priceDecimals,
    roundingMode: TRADE_FORM_PRICE_ROUNDING_MODE
  }
)

const { valueToString: notionalWithFeesToFormat } = useBigNumberFormatter(
  computed(() => props.notionalWithFees),
  {
    decimalPlaces: props.market.priceDecimals
  }
)

const { valueToString: notionalWithFeesInUsdToFormat } = useBigNumberFormatter(
  computed(() =>
    new BigNumberInBase(
      tokenStore.tokenUsdPrice(props.market.quoteToken)
    ).times(props.notionalWithFees)
  ),
  {
    decimalPlaces: props.market.priceDecimals,
    minimalDecimalPlaces: props.market.priceDecimals
  }
)

const minimumReceivedAmount = computed(() => {
  if (props.executionPrice.lte('0')) {
    return ZERO_IN_BASE
  }

  const baseAmount = isSpot ? spotBaseAmount : derivativeBaseAmount
  const quoteAmount = isSpot ? spotQuoteAmount : derivativeQuoteAmount
  const feeMultiplier = new BigNumberInBase(1).minus(props.feeRate)

  const minimumReceivedBaseAmount = isSpot
    ? baseAmount.value.times(props.executionPrice).times(feeMultiplier)
    : baseAmount.value.times(props.executionPrice)
  const minimumReceivedQuoteAmount = quoteAmount.value.div(props.executionPrice)

  return props.isBuy ? minimumReceivedQuoteAmount : minimumReceivedBaseAmount
})

const { valueToString: minimumReceivedAmountToFormat } = useBigNumberFormatter(
  computed(() => minimumReceivedAmount.value || 0),
  {
    decimalPlaces: props.isBuy
      ? props.market.quantityDecimals
      : props.market.priceDecimals
  }
)
</script>

<template>
  <div :key="formValues[TradeField.TradingType]">
    <Suspense>
      <component
        :is="orderDetailsComponent"
        v-bind="{
          isBuy,
          market,
          notionalValue,
          executionPrice,
          liquidationPrice,
          minimumReceivedAmount,
          isOrderTypeReduceOnly
        }"
      >
        <template #total>
          <span>{{ notionalWithFeesToFormat }}</span>
          <span class="text-gray-500 ml-1 break-normal">
            {{ market.quoteToken.symbol }}
          </span>
          <span
            v-if="
              QUOTE_DENOMS_TO_SHOW_USD_VALUE.includes(market.quoteToken.denom)
            "
            class="text-xs text-gray-500 ml-1"
          >
            ${{ notionalWithFeesInUsdToFormat }}
          </span>
        </template>
        <template #executionPrice>{{ executionPriceToFormat }}</template>
        <template #marketMinimumReceivedAmount>
          {{ minimumReceivedAmountToFormat }}
        </template>

        <template #makerTakerFeeRate>
          <PartialsTradingOrderDetailsMakerTakerFeeRate
            v-bind="{
              market,
              tradingType: formValues[TradeField.TradingType]
            }"
          />
        </template>

        <template #feeRate>
          <PartialsTradingOrderDetailsFeeRate
            v-bind="{
              fees,
              market,
              notionalValue
            }"
          />
        </template>

        <template #feeRebate>
          <PartialsTradingOrderDetailsFeeRebate
            v-bind="{ market, notionalValue }"
          />
        </template>

        <template #expectedPts>
          <PartialsTradingOrderDetailsExpectedPoints
            v-bind="{
              fees,
              market
            }"
          />
        </template>
      </component>

      <template #fallback>
        <div class="w-full h-40">
          <AppLoading />
        </div>
      </template>
    </Suspense>
  </div>
</template>

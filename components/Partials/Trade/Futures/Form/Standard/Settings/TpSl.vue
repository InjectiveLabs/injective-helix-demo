<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  MarketKey,
  PerpetualMarketCyTags,
  DerivativesTradeFormField
} from '@/types'
import type { PositionV2 } from '@injectivelabs/sdk-ts'
import type { UiDerivativeMarket, DerivativesTradeForm } from '@/types'

const market = inject(MarketKey) as Ref<UiDerivativeMarket>

const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const derivativeFormValues = useFormValues<DerivativesTradeForm>()
const { markPrice } = useDerivativeLastPrice(market)

const emit = defineEmits<{
  'tpsl:update': [position: PositionV2]
}>()

const props = withDefaults(
  defineProps<{
    estLiquidationPrice: BigNumberInBase
  }>(),
  {}
)

const stopLossPercentage = ref('')
const takeProfitPercentage = ref('')

const isBuy = computed(
  () =>
    derivativeFormValues.value[DerivativesTradeFormField.Side] ===
    TradeDirection.Long
)

const { value: isTpSlEnabled } = useBooleanField({
  name: DerivativesTradeFormField.isTpSlEnabled,
  initialValue: false,
  rule: ''
})

const { value: takeProfitValue, errorMessage: takeProfitErrorMessage } =
  useStringField({
    name: DerivativesTradeFormField.TakeProfit,
    initialValue: '',
    rule: '',
    dynamicRule: computed(() => {
      const formattedMarkPrice = new BigNumberInBase(markPrice.value).toFixed(
        market.value.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )

      if (isBuy.value) {
        return `minValue:${formattedMarkPrice}`
      }

      return `maxValue:${formattedMarkPrice}`
    })
  })

const { value: stopLossValue, errorMessage: stopLossErrorMessage } =
  useStringField({
    name: DerivativesTradeFormField.StopLoss,
    initialValue: '',
    rule: '',
    dynamicRule: computed(() => {
      const formattedMarkPrice = new BigNumberInBase(markPrice.value).toFixed(
        market.value.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
      const formattedEstLiquidationPrice = props.estLiquidationPrice.toFixed(
        market.value.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )

      if (isBuy.value) {
        const minValueRule = `minValue:${formattedEstLiquidationPrice}`
        const maxValueRule = `maxValue:${formattedMarkPrice}`

        return [minValueRule, maxValueRule].join('|')
      }

      const minValueRule = `minValue:${formattedMarkPrice}`
      const maxValueRule = `maxValue:${formattedEstLiquidationPrice}`

      return [minValueRule, maxValueRule].join('|')
    })
  })

const currentMarketPosition = computed(() =>
  positionStore.subaccountPositions.find(
    (position) => position.marketId === market.value.marketId
  )
)

const tpTriggerPrice = computed(() => {
  const existingTpOrder = derivativeStore.subaccountConditionalOrders.find(
    (order) =>
      (order.orderType === OrderSide.TakeBuy ||
        order.orderType === OrderSide.TakeSell) &&
      order.marketId === currentMarketPosition.value?.marketId
  )

  return existingTpOrder
    ? sharedToBalanceInTokenInBase({
        value: existingTpOrder.triggerPrice,
        decimalPlaces: market.value.quoteToken.decimals
      })
    : undefined
})

const slTriggerPrice = computed(() => {
  const existingSlOrder = derivativeStore.subaccountConditionalOrders.find(
    (order) =>
      (order.orderType === OrderSide.StopBuy ||
        order.orderType === OrderSide.StopSell) &&
      order.marketId === currentMarketPosition.value?.marketId
  )

  return existingSlOrder
    ? sharedToBalanceInTokenInBase({
        value: existingSlOrder.triggerPrice,
        decimalPlaces: market.value.quoteToken.decimals
      })
    : undefined
})

watch(() => isBuy.value, setInitialTpSl)

function updateTpSl() {
  if (currentMarketPosition.value) {
    emit('tpsl:update', currentMarketPosition.value)
  }
}

function setInitialTpSl() {
  takeProfitPercentage.value = '10'
  takeProfitValue.value = new BigNumberInBase(markPrice.value)
    .times(isBuy.value ? 1.1 : 0.9)
    .toFixed(market.value.priceDecimals)

  stopLossPercentage.value = '10'
  stopLossValue.value = new BigNumberInBase(markPrice.value)
    .times(isBuy.value ? 0.9 : 1.1)
    .toFixed(market.value.priceDecimals)
}

const onTakeProfitValueChange = useDebounceFn(() => {
  let percentageAmount = new BigNumberInBase(takeProfitValue.value)
    .dividedBy(markPrice.value)
    .minus(1)
    .times(100)

  if (!isBuy.value) {
    percentageAmount = percentageAmount.times(-1)
  }

  takeProfitPercentage.value = percentageAmount.toFixed(
    UI_DEFAULT_MIN_DISPLAY_DECIMALS
  )
}, 500)

const onTakeProfitPercentageChange = useDebounceFn(() => {
  const percentageInDecimals = new BigNumberInBase(
    takeProfitPercentage.value
  ).dividedBy(100)

  takeProfitValue.value = new BigNumberInBase(markPrice.value)
    .times(
      isBuy.value
        ? new BigNumberInBase(1).plus(percentageInDecimals)
        : new BigNumberInBase(1).minus(percentageInDecimals)
    )
    .toFixed(market.value.priceDecimals)
}, 500)

const onStopLossValueChange = useDebounceFn(() => {
  const percentageAmount = new BigNumberInBase(stopLossValue.value)
    .dividedBy(markPrice.value)
    .minus(1)
    .times(100)

  if (!isBuy.value) {
    percentageAmount.times(-1)
  }

  stopLossPercentage.value = percentageAmount.toFixed(
    UI_DEFAULT_MIN_DISPLAY_DECIMALS
  )
}, 500)

const onStopLossPercentageChange = useDebounceFn(() => {
  const percentageInDecimals = new BigNumberInBase(
    stopLossPercentage.value
  ).dividedBy(100)

  stopLossValue.value = new BigNumberInBase(markPrice.value)
    .times(
      isBuy.value
        ? new BigNumberInBase(1).minus(percentageInDecimals)
        : new BigNumberInBase(1).plus(percentageInDecimals)
    )
    .toFixed(market.value.priceDecimals)
}, 500)
</script>

<template>
  <div
    v-if="tpTriggerPrice || slTriggerPrice"
    class="flex items-center pt-4 pb-2 gap-2 justify-between"
  >
    <div class="text-xs font-medium">
      <p>
        {{ $t('trade.takeProfitOrStopLoss') }}
      </p>
      <p class="mt-1 text-[#C2C7CF]">
        <SharedAmountUsd
          v-if="tpTriggerPrice"
          v-bind="{
            useSubscript: true,
            noTrailingZeros: true,
            amount: tpTriggerPrice,
            shouldAbbreviate: false
          }"
        >
          <template #prefix>$</template>
        </SharedAmountUsd>
        <span v-else>&mdash;</span>
        <span> / </span>
        <SharedAmountUsd
          v-if="slTriggerPrice"
          v-bind="{
            useSubscript: true,
            noTrailingZeros: true,
            amount: slTriggerPrice,
            shouldAbbreviate: false
          }"
        >
          <template #prefix>$</template>
        </SharedAmountUsd>
        <span v-else>&mdash;</span>
      </p>
    </div>

    <span
      :data-cy="dataCyTag(PerpetualMarketCyTags.TpSlUpdateButton)"
      class="font-medium text-sm text-azure-blue-350 hover:text-opacity-70 cursor-pointer"
      @click="updateTpSl"
      >{{ $t('trade.adjust') }}</span
    >
  </div>

  <div v-else>
    <div class="py-2">
      <AppCheckbox
        v-model="isTpSlEnabled"
        class="text-white"
        :data-cy="dataCyTag(PerpetualMarketCyTags.TpSlCheckbox)"
        @update:model-value="setInitialTpSl"
      >
        {{ $t('trade.takeProfitOrStopLoss') }}
      </AppCheckbox>
    </div>

    <div v-if="isTpSlEnabled" class="space-y-2 mt-1 pb-3">
      <div class="flex gap-4">
        <div class="space-y-2 w-1/2 lg:w-[180px]">
          <p class="field-label">{{ $t('trade.takeProfit') }}</p>

          <AppInputField
            v-model="takeProfitValue"
            class="placeholder:font-sans"
            :placeholder="$t('trade.takeProfit')"
            :data-cy="dataCyTag(PerpetualMarketCyTags.TakeProfitInputField)"
            @update:modelValue="onTakeProfitValueChange"
          />

          <p v-if="takeProfitErrorMessage" class="error-message">
            {{ takeProfitErrorMessage }}
          </p>
        </div>

        <div class="space-y-2 flex-1 min-w-0">
          <p class="field-label">{{ $t('trade.gain') }}</p>

          <AppInputField
            v-model="takeProfitPercentage"
            class="placeholder:font-sans"
            v-bind="{
              max: 100,
              min: -100,
              placeholder: $t('trade.gain')
            }"
            @update:model-value="onTakeProfitPercentageChange"
          >
            <template #right>%</template>
          </AppInputField>
        </div>
      </div>

      <div class="flex gap-4">
        <div class="space-y-2 w-1/2 lg:w-[180px]">
          <p class="field-label">{{ $t('trade.stopLoss') }}</p>

          <AppInputField
            v-model="stopLossValue"
            class="placeholder:font-sans"
            :placeholder="$t('trade.stopLoss')"
            :data-cy="dataCyTag(PerpetualMarketCyTags.StopLossInputField)"
            @update:modelValue="onStopLossValueChange"
          />

          <p v-if="stopLossErrorMessage" class="error-message">
            {{ stopLossErrorMessage }}
          </p>
        </div>

        <div class="space-y-2 flex-1 min-w-0">
          <p class="field-label">{{ $t('trade.loss') }}</p>

          <AppInputField
            v-model="stopLossPercentage"
            class="placeholder:font-sans"
            v-bind="{
              max: 100,
              min: -100,
              placeholder: $t('trade.loss')
            }"
            @update:model-value="onStopLossPercentageChange"
          >
            <template #right>%</template>
          </AppInputField>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { BigNumberInBase } from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  BusEvents,
  MarketKey,
  DerivativeTradeTypes,
  PerpetualMarketCyTags,
  DerivativesTradeFormField
} from '@/types'
import type { UiDerivativeMarket, DerivativesTradeForm } from '@/types'

const appStore = useAppStore()
const orderbookStore = useOrderbookStore()
const sharedTokenStore = useSharedTokenStore()
const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const market = inject(MarketKey) as Ref<UiDerivativeMarket>

const { lastTradedPrice } = useDerivativeLastPrice(computed(() => market.value))

const {
  errorMessage,
  value: limitValue,
  resetField: resetLimitValue
} = useStringField({
  name: DerivativesTradeFormField.LimitPrice,
  initialValue: '',
  dynamicRule: computed(() => {
    if (
      appStore.devMode ||
      derivativeFormValues.value[DerivativesTradeFormField.BypassPriceWarning]
    ) {
      return ''
    }

    if (lastTradedPrice.value.isZero()) {
      return ''
    }

    return `priceTooFarFromLastTradePrice:${lastTradedPrice.value.toFixed()}`
  })
})

const hasClickedLimitField = ref(false)

const { valueToFixed: limitPriceInUsdToFixed } = useSharedBigNumberFormatter(
  computed(() =>
    new BigNumberInBase(limitValue.value || 0).times(
      sharedTokenStore.tokenUsdPrice(market.value.quoteToken)
    )
  )
)

onMounted(() => {
  useEventBus(BusEvents.OrderbookPriceClick).on((price: any) => {
    limitValue.value = price
  })

  useEventBus(BusEvents.OrderSideToggled).on(() => {
    hasClickedLimitField.value = false
    setLimitPriceToTopOfOrderbook()
  })

  useEventBus(BusEvents.OrderbookReplaced).on(() => {
    if (limitValue.value || hasClickedLimitField.value) {
      return
    }

    setLimitPriceToTopOfOrderbook()
  })
})

function setLimitPriceToTopOfOrderbook() {
  if (!orderbookStore.highestBuyPrice || !orderbookStore.lowestSellPrice) {
    return
  }

  if (
    derivativeFormValues.value[DerivativesTradeFormField.Type] ===
    DerivativeTradeTypes.StopLimit
  ) {
    return
  }

  limitValue.value =
    derivativeFormValues.value[DerivativesTradeFormField.Side] ===
    TradeDirection.Long
      ? orderbookStore.highestBuyPrice
      : orderbookStore.lowestSellPrice
}

function onResetLimitField() {
  if (hasClickedLimitField.value) {
    return
  }

  resetLimitValue()
  hasClickedLimitField.value = true
}
</script>

<template>
  <div v-if="market" class="space-y-2">
    <div class="flex justify-between items-center">
      <p class="field-label">{{ $t('trade.limitPrice') }}</p>

      <div class="text-xs text-coolGray-450">
        <SharedAmountUsd
          v-bind="{
            shouldAbbreviate: false,
            amount: limitPriceInUsdToFixed
          }"
        >
          <template #prefix>~$</template>
        </SharedAmountUsd>
      </div>
    </div>

    <AppInputField
      v-model="limitValue"
      v-bind="{
        placeholder: '0.00',
        decimals: market.priceDecimals
      }"
      :data-cy="dataCyTag(PerpetualMarketCyTags.LimitpriceInputField)"
      @click="onResetLimitField"
    >
      <template #right>
        <span class="text-sm flex items-center text-white">
          {{ market.quoteToken.symbol }}
        </span>
      </template>
    </AppInputField>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

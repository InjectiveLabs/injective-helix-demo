<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { BigNumberInBase } from '@injectivelabs/utils'
import { OrderSide } from '@injectivelabs/ts-types'

import {
  MarketKey,
  BusEvents,
  UiSpotMarket,
  SpotTradeForm,
  SpotMarketCyTags,
  SpotTradeFormField
} from '@/types'

const appStore = useAppStore()
const tokenStore = useTokenStore()
const orderbookStore = useOrderbookStore()
const spotFormValues = useFormValues<SpotTradeForm>()

const market = inject(MarketKey) as Ref<UiSpotMarket>

const { lastTradedPrice } = useSpotLastPrice(computed(() => market.value))

const {
  errorMessage,
  value: limitValue,
  resetField: resetLimitValue
} = useStringField({
  name: SpotTradeFormField.Price,
  initialValue: '',
  dynamicRule: computed(() => {
    if (
      appStore.devMode ||
      spotFormValues.value[SpotTradeFormField.BypassPriceWarning]
    ) {
      return ''
    }

    if (lastTradedPrice.value.isZero()) {
      return ''
    }

    return `priceTooFarFromLastTradePrice:${lastTradedPrice.value.toFixed()}`
  })
})

const el = ref(null)
const hasClickedLimitField = ref(false)

const { valueToFixed: limitPriceInUsdToFixed } = useSharedBigNumberFormatter(
  computed(() =>
    new BigNumberInBase(limitValue.value || 0).times(
      tokenStore.tokenUsdPrice(market.value.quoteToken)
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

  limitValue.value =
    spotFormValues.value[SpotTradeFormField.Side] === OrderSide.Buy
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
  <div v-if="market" ref="el" class="space-y-2">
    <div class="flex justify-between items-center">
      <p class="field-label">{{ $t('trade.limitPrice') }}</p>

      <div class="text-xs text-coolGray-450">
        <span>~$</span>
        <AppUsdAmount
          v-bind="{
            amount: limitPriceInUsdToFixed
          }"
        />
      </div>
    </div>

    <AppInputField
      v-model="limitValue"
      v-bind="{
        placeholder: '0.00',
        decimals: market.priceDecimals
      }"
      :data-cy="dataCyTag(SpotMarketCyTags.LimitPriceInputField)"
      @click="onResetLimitField"
    >
      <template #right>
        <span class="text-sm flex items-center text-white">
          {{ market.quoteToken.symbol }}
        </span>
      </template>
    </AppInputField>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

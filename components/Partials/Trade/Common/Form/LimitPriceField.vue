<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  MarketKey,
  BusEvents,
  IsSpotKey,
  PerpetualMarketCyTags,
  SpotMarketCyTags
} from '@/types'
import type { UiMarketWithToken } from '@/types'

const props = withDefaults(
  defineProps<{
    isBuy?: boolean
    fieldName: string
    shouldSkipAutoSet?: boolean
    bypassPriceWarning?: boolean
    lastTradedPrice: BigNumberInBase
  }>(),
  {}
)

const appStore = useAppStore()
const orderbookStore = useOrderbookStore()

const isSpot = inject(IsSpotKey)
const market = inject(MarketKey) as Ref<UiMarketWithToken>

const {
  errorMessage,
  value: limitValue,
  resetField: resetLimitValue
} = useStringField({
  name: props.fieldName,
  initialValue: '',
  dynamicRule: computed(() => {
    if (
      appStore.devMode ||
      props.bypassPriceWarning ||
      props.lastTradedPrice.isZero()
    ) {
      return ''
    }

    return `priceTooFarFromLastTradePrice:${props.lastTradedPrice.toFixed()}`
  })
})

const hasClickedLimitField = ref(false)

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

  if (props.shouldSkipAutoSet) {
    return
  }

  limitValue.value = props.isBuy
    ? orderbookStore.highestBuyPrice
    : orderbookStore.lowestSellPrice
}

function setLimitPriceToMid() {
  if (!orderbookStore.highestBuyPrice || !orderbookStore.lowestSellPrice) {
    return
  }

  const midValue = new BigNumberInBase(orderbookStore.highestBuyPrice)
    .plus(orderbookStore.lowestSellPrice)
    .dividedBy(2)

  if (midValue.isNaN()) {
    return
  }

  hasClickedLimitField.value = true
  limitValue.value = midValue.toFixed(market.value.priceDecimals)
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
    <div class="flex items-center">
      <p class="field-label">{{ $t('trade.limitPrice') }}</p>
    </div>

    <AppInputField
      v-model="limitValue"
      v-bind="{
        placeholder: '0.00',
        decimals: market.priceDecimals
      }"
      :data-cy="
        dataCyTag(
          isSpot
            ? SpotMarketCyTags.LimitPriceInputField
            : PerpetualMarketCyTags.LimitpriceInputField
        )
      "
      @click="onResetLimitField"
    >
      <template #right>
        <div class="flex items-center text-sm">
          <span
            class="text-azure-blue-350 cursor-pointer font-semibold uppercase"
            @click.prevent.stop="setLimitPriceToMid"
          >
            {{ $t('trade.mid') }}
          </span>
        </div>
      </template>
    </AppInputField>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

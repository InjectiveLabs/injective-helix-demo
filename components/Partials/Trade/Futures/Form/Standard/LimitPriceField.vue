<script setup lang="ts">
import {
  BusEvents,
  MarketKey,
  UiDerivativeMarket,
  DerivativesTradeForm,
  PerpetualmarketCyTags,
  DerivativesTradeFormField
} from '@/types'

const appStore = useAppStore()
const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const market = inject(MarketKey) as Ref<UiDerivativeMarket>

const { lastTradedPrice } = useDerivativeLastPrice(computed(() => market.value))

const { value: limit, errorMessage } = useStringField({
  name: DerivativesTradeFormField.LimitPrice,
  initialValue: '',
  dynamicRule: computed(() => {
    if (
      appStore.devMode ||
      derivativeFormValues.value[DerivativesTradeFormField.BypassPriceWarning]
    ) {
      return ''
    }

    return `priceTooFarFromLastTradePrice:${lastTradedPrice.value?.toFixed()}`
  })
})

function setMidLimitPrice() {
  if (!lastTradedPrice.value) {
    return
  }

  limit.value = lastTradedPrice.value.toFixed()
}

onMounted(() => {
  useEventBus(BusEvents.OrderbookPriceClick).on((price: any) => {
    limit.value = price
  })
})
</script>

<template>
  <div v-if="market" class="space-y-2">
    <p class="field-label">{{ $t('trade.limitPrice') }}</p>

    <AppInputField
      v-model="limit"
      v-bind="{
        placeholder: '0.00',
        decimals: market.priceDecimals
      }"
      :data-cy="dataCyTag(PerpetualmarketCyTags.LimitpriceInputField)"
    >
      <template #left>
        <div
          class="text-xs text-gray-400 select-none hover:text-white flex font-mono cursor-pointer"
          @click="setMidLimitPrice"
        >
          {{ $t('trade.mid') }}
        </div>
      </template>

      <template #right>
        <span class="text-sm">
          {{ market.quoteToken.symbol }}
        </span>
      </template>
    </AppInputField>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

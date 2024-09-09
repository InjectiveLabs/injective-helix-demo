<script setup lang="ts">
import {
  MarketKey,
  BusEvents,
  UiSpotMarket,
  SpotTradeForm,
  SpotMarketCyTags,
  SpotTradeFormField
} from '@/types'

const appStore = useAppStore()
const spotFormValues = useFormValues<SpotTradeForm>()

const market = inject(MarketKey) as Ref<UiSpotMarket>

const { lastTradedPrice } = useSpotLastPrice(computed(() => market.value))

const { value: limitValue, errorMessage } = useStringField({
  name: SpotTradeFormField.Price,
  initialValue: '',
  dynamicRule: computed(() => {
    if (
      appStore.devMode ||
      spotFormValues.value[SpotTradeFormField.BypassPriceWarning]
    ) {
      return ''
    }

    return `priceTooFarFromLastTradePrice:${lastTradedPrice.value?.toFixed()}`
  })
})

const el = ref(null)

const value = computed({
  get: () => limitValue.value,
  set: (value: string) => {
    limitValue.value = value
  }
})

function setMidLimitPrice() {
  if (!lastTradedPrice.value) {
    return
  }

  value.value = lastTradedPrice.value.toFixed()
}

onMounted(() => {
  useEventBus(BusEvents.OrderbookPriceClick).on((price: any) => {
    value.value = price
  })
})
</script>

<template>
  <div v-if="market" ref="el" class="space-y-2">
    <p class="field-label">{{ $t('trade.limitPrice') }}</p>

    <AppInputField
      v-model="value"
      v-bind="{
        placeholder: '0.00',
        decimals: market.priceDecimals
      }"
      :data-cy="dataCyTag(SpotMarketCyTags.LimitPriceInputField)"
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

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

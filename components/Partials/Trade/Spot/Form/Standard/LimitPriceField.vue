<script setup lang="ts">
import { MarketKey, BusEvents, UiSpotMarket, SpotTradeFormField } from '@/types'

const appStore = useAppStore()

const market = inject(MarketKey) as Ref<UiSpotMarket>

const { lastTradedPrice } = useSpotLastPrice(computed(() => market.value))

const { value: limitValue, errorMessage } = useStringField({
  name: SpotTradeFormField.Price,
  initialValue: '',
  dynamicRule: computed(() => {
    const priceTooFarFromLastTradePrice = `priceTooFarFromLastTradePrice:${lastTradedPrice.value?.toFixed()}`

    if (appStore.devMode) {
      return ''
    }

    return priceTooFarFromLastTradePrice
  })
})

const el = ref(null)

const value = computed({
  get: () => limitValue.value,
  set: (value: string) => {
    limitValue.value = value
  }
})

onMounted(() => {
  useEventBus(BusEvents.OrderbookPriceClick).on((price: any) => {
    value.value = price
  })
})
</script>

<template>
  <div v-if="market" ref="el" class="space-y-2">
    <p class="field-label">{{ $t('trade.limitPrice') }}</p>

    <AppInputField v-model="value" placeholder="0.00">
      <template #right>
        <span class="text-sm">
          {{ market.quoteToken.symbol }}
        </span>
      </template>
    </AppInputField>

    <div v-if="errorMessage" class="error-message capitalize">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { SpotTradeFormField, spotMarketKey } from '@/types'

const market = inject(spotMarketKey)

const el = ref(null)

const { focused } = useFocusWithin(el)

const setQuantityAmount = useSetFieldValue(SpotTradeFormField.Quantity)

const { value: totalValue, errorMessage } = useStringField({
  name: SpotTradeFormField.Total,
  initialValue: '',
  rule: ''
})

const { lastTradedPrice } = useSpotLastPrice(
  computed(() => market?.value as UiSpotMarketWithToken)
)

const value = computed({
  get: () => totalValue.value,
  set: (value: string) => {
    totalValue.value = value

    // If the value is empty, set the quantity amount to empty
    if (value === '') {
      setQuantityAmount('')
      return
    }

    // If the input is focused, calculate the quantity amount

    if (focused.value) {
      setQuantityAmount(
        new BigNumberInBase(value).div(lastTradedPrice.value).toFixed(3)
      )
    }
  }
})
</script>

<template>
  <div v-if="market" ref="el" class="space-y-2">
    <p class="field-label">{{ $t('trade.total') }}</p>

    <AppInputField v-model="value" placeholder="0.00">
      <template #left>
        <span>&thickapprox;</span>
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

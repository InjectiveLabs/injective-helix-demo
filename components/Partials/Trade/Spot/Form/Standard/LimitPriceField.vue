<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { SpotTradeForm, SpotTradeFormField, spotMarketKey } from '@/types'

const { value: limitValue, errorMessage } = useStringField({
  name: SpotTradeFormField.Price,
  initialValue: ''
})

const market = inject(spotMarketKey)

const el = ref(null)

const { focused } = useFocusWithin(el)
const spotFormValues = useFormValues<SpotTradeForm>()

const setQuantity = useSetFieldValue(SpotTradeFormField.Quantity)
const setTotalAmount = useSetFieldValue(SpotTradeFormField.Total)

const value = computed({
  get: () => limitValue.value,
  set: (value: string) => {
    limitValue.value = value

    if (focused.effect) {
      // If the value is empty, set the total amount to empty
      if (value === '') {
        setTotalAmount('')
        return
      }

      if (spotFormValues.value[SpotTradeFormField.Quantity]) {
        setTotalAmount(
          new BigNumberInBase(value)
            .times(spotFormValues.value[SpotTradeFormField.Quantity])
            .toFixed(3)
        )
      } else if (spotFormValues.value[SpotTradeFormField.Total]) {
        setQuantity(
          new BigNumberInBase(spotFormValues.value[SpotTradeFormField.Total])
            .div(value)
            .toFixed(3)
        )
      }
    }
  }
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

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

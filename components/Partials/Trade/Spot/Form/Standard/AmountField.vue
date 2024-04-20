<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  SpotTradeForm,
  SpotTradeFormField,
  TradeTypes,
  orderbookWorkerKey,
  spotMarketKey
} from '@/types'

import { WorkerMessageType } from '~/types/worker'

const market = inject(spotMarketKey)
const worker = inject(orderbookWorkerKey)

const el = ref(null)

const { focused } = useFocusWithin(el)
const spotFormValues = useFormValues<SpotTradeForm>()
const setTotalAmount = useSetFieldValue(SpotTradeFormField.Total)

const { value: amountValue, errorMessage } = useStringField({
  name: SpotTradeFormField.Quantity,
  initialValue: ''
})

const { lastTradedPrice } = useSpotLastPrice(
  computed(() => market?.value as UiSpotMarketWithToken)
)

const value = computed({
  get: () => amountValue.value,
  set: (value: string) => {
    amountValue.value = value

    // If the value is empty, set the total amount to empty
    if (value === '' && focused.value) {
      setTotalAmount('')
      return
    }

    // If the input is focused, calculate the total amount
    if (focused.value) {
      if (spotFormValues.value[SpotTradeFormField.Type] === TradeTypes.Market) {
        setTotalAmount(lastTradedPrice.value.times(value).toFixed(3))
      } else if (spotFormValues.value[SpotTradeFormField.Price]) {
        setTotalAmount(
          new BigNumberInBase(spotFormValues.value[SpotTradeFormField.Price])
            .times(value)
            .toFixed(3)
        )
      }
    }
  }
})

watch(
  () => [value.value, spotFormValues.value[SpotTradeFormField.Type]],
  ([quantity, type]) => {
    if (type !== TradeTypes.Market) {
      return
    }

    worker?.value?.postMessage({
      type: WorkerMessageType.WorstPrice,
      data: {
        quantity: quantity || '',
        baseDecimals: 1,
        isBuy: true,
        isSpot: true,
        quoteDecimals: 1
      }
    })
  }
)
</script>

<template>
  <div ref="el" class="space-y-2">
    <p class="field-label">{{ $t('trade.amount') }}</p>

    <AppInputField v-model="value" placeholder="0.00">
      <template #right>
        <span class="text-sm">
          {{ market?.baseToken.symbol }}
        </span>
      </template>
    </AppInputField>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

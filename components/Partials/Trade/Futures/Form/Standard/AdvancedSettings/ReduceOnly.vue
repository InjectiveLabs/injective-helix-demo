<script setup lang="ts">
import {
  DerivativeMarketKey,
  DerivativesTradeForm,
  DerivativesTradeFormField
} from '@/types'

const derivativeMarket = inject(DerivativeMarketKey)

const { value: reduceOnly } = useBooleanField({
  name: DerivativesTradeFormField.ReduceOnly,
  initialValue: false,
  rule: ''
})

const positionStore = usePositionStore()
const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const position = computed(() =>
  positionStore.subaccountPositions.find(
    (position) => position.marketId === derivativeMarket?.value?.marketId
  )
)

const disabled = computed(
  () =>
    !position.value ||
    position.value.direction ===
      derivativeFormValues.value[DerivativesTradeFormField.Side]
)

watchEffect(() => {
  if (disabled.value) {
    reduceOnly.value = false
  }
})
</script>

<template>
  <div>
    <AppCheckbox2 v-bind="{ disabled }" v-model="reduceOnly">
      {{ $t('trade.reduceOnly') }}
    </AppCheckbox2>
  </div>
</template>

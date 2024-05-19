<script setup lang="ts">
import { DerivativesTradeFormField } from '@/types'

const { value: reduceOnly } = useBooleanField({
  name: DerivativesTradeFormField.ReduceOnly,
  initialValue: false,
  rule: ''
})

const positionStore = usePositionStore()

const hasOpenPositions = computed(() => {
  return positionStore.subaccountPositions.length > 0
})

const disabled = computed(() => !hasOpenPositions.value)
</script>

<template>
  <div>
    {{ { disabled } }}
    <AppCheckbox2 v-bind="{ disabled }" v-model="reduceOnly">
      Reduce Only
    </AppCheckbox2>
  </div>
</template>

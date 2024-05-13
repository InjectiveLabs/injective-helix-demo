<script setup lang="ts">
import { DerivativesTradeFormField } from '@/types'

const { value: reduceOnly } = useBooleanField({
  name: DerivativesTradeFormField.ReduceOnly,
  initialValue: false,
  rule: ''
})
</script>

<template>
  <div>
    <AppCheckbox2 v-model="reduceOnly">Reduce Only</AppCheckbox2>
  </div>
</template>

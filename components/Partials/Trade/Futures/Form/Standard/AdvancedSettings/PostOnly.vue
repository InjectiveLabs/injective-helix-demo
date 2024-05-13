<script setup lang="ts">
import { DerivativesTradeFormField } from '@/types'

const { value: postOnly } = useBooleanField({
  name: DerivativesTradeFormField.PostOnly,
  initialValue: false,
  rule: ''
})
</script>

<template>
  <div>
    <AppCheckbox2 v-model="postOnly">Post Only</AppCheckbox2>
  </div>
</template>

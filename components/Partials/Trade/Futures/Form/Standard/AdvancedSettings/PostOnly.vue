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
    <AppCheckbox v-model="postOnly">Post Only</AppCheckbox>
  </div>
</template>

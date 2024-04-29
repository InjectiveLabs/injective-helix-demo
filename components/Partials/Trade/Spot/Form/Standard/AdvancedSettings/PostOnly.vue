<script setup lang="ts">
import { SpotTradeFormField } from '@/types'

const { value: postOnlyValue } = useBooleanField({
  name: SpotTradeFormField.PostOnly,
  initialValue: false
})
</script>

<template>
  <div>
    <AppCheckbox v-model="postOnlyValue">Post Only</AppCheckbox>
  </div>
</template>

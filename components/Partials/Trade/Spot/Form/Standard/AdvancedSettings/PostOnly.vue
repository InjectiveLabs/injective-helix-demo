<script setup lang="ts">
import { SpotTradeFormField } from '@/types'

const { value: postOnlyValue } = useBooleanField({
  name: SpotTradeFormField.PostOnly,
  initialValue: false
})
</script>

<template>
  <div>
    <AppCheckbox2 v-model="postOnlyValue" class="w-full">
      Post Only
    </AppCheckbox2>
  </div>
</template>

<script setup lang="ts">
import { SpotTradeFormField } from '@/types'

const { value: postOnlyValue } = useBooleanField({
  name: SpotTradeFormField.PostOnly,
  initialValue: false,
  rule: ''
})
</script>

<template>
  <div>
    <AppCheckbox2 v-model="postOnlyValue" class="w-full">
      {{ $t('trade.postOnly') }}
    </AppCheckbox2>
  </div>
</template>

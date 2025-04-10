<script setup lang="ts">
import { DerivativesTradeFormField } from '@/types'

const jsonStore = useSharedJsonStore()

const { value: postOnly } = useBooleanField({
  rule: '',
  name: DerivativesTradeFormField.PostOnly,
  initialValue: jsonStore.isPostUpgradeMode
})
</script>

<template>
  <div>
    <AppCheckbox2
      v-model="postOnly"
      :disabled="jsonStore.isPostUpgradeMode"
      class="text-white"
    >
      {{ $t('trade.postOnly') }}
    </AppCheckbox2>
  </div>
</template>

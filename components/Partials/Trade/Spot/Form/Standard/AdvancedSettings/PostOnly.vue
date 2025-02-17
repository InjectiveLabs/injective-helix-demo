<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { SpotTradeFormField, SpotMarketCyTags } from '@/types'

const { value: postOnlyValue } = useBooleanField({
  name: SpotTradeFormField.PostOnly,
  initialValue: false,
  rule: ''
})
</script>

<template>
  <div>
    <AppCheckbox2
      v-model="postOnlyValue"
      class="w-full text-white"
      :data-cy="dataCyTag(SpotMarketCyTags.AdvancedSettingsPostOnly)"
    >
      {{ $t('trade.postOnly') }}
    </AppCheckbox2>
  </div>
</template>

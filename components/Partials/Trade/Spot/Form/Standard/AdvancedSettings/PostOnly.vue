<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { SpotMarketCyTags, SpotTradeFormField } from '@/types'

const jsonStore = useSharedJsonStore()

const { value: postOnlyValue } = useBooleanField({
  rule: '',
  name: SpotTradeFormField.PostOnly,
  initialValue: jsonStore.isPostUpgradeMode
})
</script>

<template>
  <div>
    <AppCheckbox2
      v-model="postOnlyValue"
      class="w-full text-white"
      :disabled="jsonStore.isPostUpgradeMode"
      :data-cy="dataCyTag(SpotMarketCyTags.AdvancedSettingsPostOnly)"
    >
      {{ $t('trade.postOnly') }}
    </AppCheckbox2>
  </div>
</template>

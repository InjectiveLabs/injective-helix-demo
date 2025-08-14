<script setup lang="ts">
import { DerivativesTradeFormField, PerpetualMarketCyTags } from '@/types'

const jsonStore = useSharedJsonStore()

const { value: postOnly } = useBooleanField({
  rule: '',
  name: DerivativesTradeFormField.PostOnly,
  initialValue: jsonStore.isPostUpgradeMode
})
</script>

<template>
  <div>
    <AppCheckbox
      v-model="postOnly"
      :disabled="jsonStore.isPostUpgradeMode"
      class="text-white"
      :data-cy="dataCyTag(PerpetualMarketCyTags.AdvancedSettingsPostOnlyCheckbox)"
    >
      {{ $t('trade.postOnly') }}
    </AppCheckbox>
  </div>
</template>

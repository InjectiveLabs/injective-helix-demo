<script setup lang="ts">
import { IsSpotKey, PerpetualMarketCyTags, SpotMarketCyTags } from '@/types'

const props = withDefaults(
  defineProps<{
    formFieldName: string
  }>(),
  {}
)

const isSpot = inject(IsSpotKey)

const { value: bypassPriceWarningValue } = useBooleanField({
  rule: '',
  name: props.formFieldName
})
</script>

<template>
  <div>
    <AppCheckbox
      v-model="bypassPriceWarningValue"
      class="w-full text-white"
      :data-cy="
        dataCyTag(
          isSpot
            ? SpotMarketCyTags.AdvancedSettingsBypassWarning
            : PerpetualMarketCyTags.AdvancedSettingsByPassPriceWarningCheckbox
        )
      "
    >
      {{ $t('trade.bypassPriceWarning') }}
    </AppCheckbox>
  </div>
</template>

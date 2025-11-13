<script setup lang="ts">
import { IsSpotKey, PerpetualMarketCyTags, SpotMarketCyTags } from '@/types'

const props = withDefaults(
  defineProps<{
    formFieldName: string
  }>(),
  {}
)

const isSpot = inject(IsSpotKey)

const jsonStore = useSharedJsonStore()

const { value: postOnlyValue } = useBooleanField({
  rule: '',
  name: props.formFieldName,
  initialValue: jsonStore.isPostUpgradeMode
})
</script>

<template>
  <div>
    <AppCheckbox
      v-model="postOnlyValue"
      class="w-full text-white"
      :data-cy="
        dataCyTag(
          isSpot
            ? SpotMarketCyTags.AdvancedSettingsPostOnly
            : PerpetualMarketCyTags.AdvancedSettingsPostOnlyCheckbox
        )
      "
      :disabled="jsonStore.isPostUpgradeMode"
    >
      {{ $t('trade.postOnly') }}
    </AppCheckbox>
  </div>
</template>

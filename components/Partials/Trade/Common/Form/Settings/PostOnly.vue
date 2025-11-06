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

const cyTag = computed(() =>
  isSpot
    ? SpotMarketCyTags.AdvancedSettingsPostOnly
    : PerpetualMarketCyTags.AdvancedSettingsPostOnlyCheckbox
)
</script>

<template>
  <div>
    <AppCheckbox
      v-model="postOnlyValue"
      class="w-full text-white"
      :data-cy="dataCyTag(cyTag)"
      :disabled="jsonStore.isPostUpgradeMode"
    >
      {{ $t('trade.postOnly') }}
    </AppCheckbox>
  </div>
</template>

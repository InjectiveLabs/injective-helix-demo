<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    cyTag: string
    formFieldName: string
  }>(),
  {}
)

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
      :data-cy="dataCyTag(cyTag)"
      :disabled="jsonStore.isPostUpgradeMode"
    >
      {{ $t('trade.postOnly') }}
    </AppCheckbox>
  </div>
</template>

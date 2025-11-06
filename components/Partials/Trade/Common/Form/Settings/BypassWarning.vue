<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    cyTag: string
    formFieldName: string
  }>(),
  {}
)

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
      :data-cy="dataCyTag(cyTag)"
    >
      {{ $t('trade.bypassPriceWarning') }}
    </AppCheckbox>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    itemKey: string
    itemImage: string
    selectedCharacter: string
  }>(),
  {}
)

const emit = defineEmits<{
  'option:select': [key: string]
}>()

function onClick() {
  emit('option:select', props.itemKey)
}
</script>

<template>
  <span
    :class="[
      selectedCharacter === itemKey ? 'border-blue-500' : 'border-coolGray-500'
    ]"
    class="border rounded-lg overflow-hidden size-14 cursor-pointer lg:hover:border-white transition-colors"
    @click="onClick"
  >
    <img :alt="itemKey" :src="itemImage" class="w-full h-full object-contain" />
  </span>
</template>

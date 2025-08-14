<script lang="ts" setup>
const emit = defineEmits<{
  'dot:click': [value: number]
}>()

const props = defineProps<{
  index: number
  selectedIndex: number
}>()

function onClick() {
  emit('dot:click', props.index)
}
</script>

<template>
  <span
    class="embla__dot"
    :class="{ 'embla__dot--selected': index === selectedIndex }"
    @click="onClick"
  />
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue'

const props = defineProps({
  list: {
    type: Object as PropType<Record<string, number>>,
    required: true
  },

  value: {
    type: [String, Number],
    required: true
  }
})

const filteredList = computed(() => {
  return Object.entries(props.list).filter(([, value]) => {
    return (Number(props.value) & value) === value
  })
})
</script>

<template>
  <slot :filtered-list="filteredList" />
</template>

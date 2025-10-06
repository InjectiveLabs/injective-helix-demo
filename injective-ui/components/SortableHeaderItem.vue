<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
  isAscending: Boolean,

  value: {
    type: String,
    required: true
  },

  sortBy: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  'sortBy:changed': [value: string]
  'isAscending:changed': [value: boolean]
  'update:sortBy': [value: string]
  'update:isAscending': [value: boolean]
}>()

const isActive = computed(() => props.sortBy === props.value)

function onSort() {
  if (props.value !== props.sortBy) {
    emit('update:sortBy', props.value)
    emit('sortBy:changed', props.value)
    emit('update:isAscending', false)
    emit('isAscending:changed', false)
  } else {
    emit('update:isAscending', !props.isAscending)
    emit('isAscending:changed', !props.isAscending)
  }
}
</script>

<template>
  <th @click="onSort">
    <slot :is-active="isActive" />
  </th>
</template>

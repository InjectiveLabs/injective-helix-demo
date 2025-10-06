<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  activeClass: {
    type: String,
    default: ''
  },

  modelValue: {
    type: [String, Number],
    default: ''
  },

  value: {
    type: [String, Number],
    default: ''
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const isActive = computed(() => props.modelValue === props.value)

function onClick() {
  if (props.value === props.modelValue) {
    emit('update:modelValue', '')

    return
  }

  emit('update:modelValue', props.value)
}
</script>

<template>
  <div class="accordion" :class="[isActive ? activeClass : '']">
    <div class="header" @click="onClick">
      <slot name="header" v-bind="{ isActive }" />
    </div>
    <div class="content" :class="[isActive ? 'open' : 'closed']">
      <div>
        <slot name="content" v-bind="{ isActive }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.accordion {
  .header {
    user-select: none;
  }

  .content {
    display: grid;
    transition: all 0.3s;
  }
  .content > div {
    overflow: hidden;
  }
  .open {
    grid-template-rows: 1fr;
  }
  .closed {
    grid-template-rows: 0fr;
  }
}
</style>

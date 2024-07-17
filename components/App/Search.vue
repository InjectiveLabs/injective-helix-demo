<script lang="ts" setup>
const props = defineProps({
  isSm: Boolean,
  isPrefixVisible: Boolean,

  inputClasses: {
    type: String,
    default: ''
  }
})

const inputClass = computed(() => {
  const result = []

  if (props.isPrefixVisible) {
    result.push('px-2')
  }

  result.push(props.inputClasses)

  return result.join(' ')
})
</script>

<template>
  <AppInput
    v-bind="$attrs"
    ref="search-input"
    :is-sm="isSm"
    :input-classes="inputClass"
  >
    <template v-if="isPrefixVisible" #prefix>
      <SharedIcon name="search" :class="[isSm ? 'w-4 h-4' : 'w-5 h-5']" />
    </template>

    <template v-else #addon>
      <SharedIcon name="search" :class="[isSm ? 'w-4 h-4' : 'w-5 h-5']" />
    </template>
  </AppInput>
</template>

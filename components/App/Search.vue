<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    isSm?: boolean
    isPrefixVisible?: boolean
    inputClasses?: string
  }>(),
  {
    isSm: false,
    isPrefixVisible: false,
    inputClasses: ''
  }
)

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

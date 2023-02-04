<script lang="ts" setup>
const props = defineProps({
  lg: Boolean,
  md: Boolean,
  dense: Boolean
})

const isDefaultSize = computed(() => {
  return !props.md && !props.lg && !props.dense
})
</script>

<template>
  <div
    class="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-4 text-gray-200 v-table-row items-center text-xs xs:text-sm lg:text-xs xl:text-sm"
    :class="[
      {
        'p-3 xs:leading-3': dense,
        'px-6 py-3': lg,
        'px-3 py-3': md,
        'px-3 py-4': isDefaultSize
      }
    ]"
  >
    <slot />
  </div>
</template>

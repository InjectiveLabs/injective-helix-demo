<script lang="ts" setup>
defineProps({
  isLg: Boolean,
  isMd: Boolean,
  isDense: Boolean
})
</script>

<template>
  <div
    class="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-4 text-gray-200 v-table-row items-center text-xs xs:text-sm lg:text-xs xl:text-sm"
    :class="{
      'p-3 xs:leading-3': isDense,
      'px-6 py-3': isLg,
      'px-3 py-3': isMd,
      'px-3 py-4': !isMd && !isLg && !isDense
    }"
  >
    <slot />
  </div>
</template>

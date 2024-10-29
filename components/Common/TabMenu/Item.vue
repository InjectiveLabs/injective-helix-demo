<script lang="ts" setup>
withDefaults(defineProps<{ isActive?: boolean }>(), { isActive: false })
</script>

<template>
  <div
    class="group px-4 h-[40px] cursor-pointer relative flex items-center justify-center"
    :class="{
      'text-coolGray-300': !isActive,
      'text-blue-500': isActive
    }"
  >
    <p class="text-sm capitalize select-none whitespace-nowrap">
      <slot />
    </p>
    <div
      class="group-hover:block absolute inset-0 pointer-events-none"
      :class="{
        hidden: !isActive
      }"
    >
      <div class="h-[2px] w-full bg-blue-500 absolute bottom-0" />
    </div>
  </div>
</template>

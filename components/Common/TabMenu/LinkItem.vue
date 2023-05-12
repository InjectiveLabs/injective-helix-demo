<script lang="ts" setup>
import { PropType } from 'vue'
import { RouteLocationNamedRaw } from 'vue-router'

defineProps({
  to: {
    type: Object as PropType<RouteLocationNamedRaw>,
    required: true
  }
})
</script>

<template>
  <NuxtLink
    v-bind="{
      to
    }"
    class="group px-4 h-[40px] cursor-pointer relative flex items-center justify-center text-gray-300"
  >
    <p class="text-sm capitalize select-none whitespace-nowrap">
      <slot />
    </p>
    <div
      class="group-hover:block absolute inset-0 pointer-events-none hidden bottom-line"
    >
      <div class="h-[2px] w-full bg-blue-500 absolute bottom-0" />
    </div>
  </NuxtLink>
</template>

<style scoped>
.router-link-exact-active {
  @apply text-blue-500;
}

.router-link-exact-active .bottom-line {
  @apply block;
}
</style>

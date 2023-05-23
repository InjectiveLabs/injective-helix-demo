<script setup lang="ts">
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
    class="text-xs xs:text-sm leading-5 tracking-wide cursor-pointer uppercase opacity-50"
    exact-active-class=""
  >
    <div class="flex items-center gap-1">
      <span class="whitespace-nowrap">
        <slot />
      </span>
    </div>
  </NuxtLink>
</template>

<style scoped>
.router-link-exact-active {
  @apply text-blue-500 hover:text-blue-600 font-bold opacity-100;
}
</style>

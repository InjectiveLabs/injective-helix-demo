<script lang="ts" setup>
import { RouteLocationNamedRaw } from 'vue-router'

defineProps({
  isLg: Boolean,
  isLoading: Boolean,

  to: {
    type: Object as PropType<RouteLocationNamedRaw>,
    required: true
  }
})
</script>

<template>
  <NuxtLink
    :to="to"
    class="group w-full border-t-4 cursor-pointer shadow-card text-gray-100 bg-gray-900 border-transparent rounded-b-md opacity-50 rounded-t-md hover:border-blue-500 hover:rounded-b-md hover:rounded-t-none hover:opacity-100"
    :class="{
      'px-4 py-5': isLg,
      'p-3 lg:px-4 lg:py-5': !isLg
    }"
  >
    <div
      class="h-full flex flex-col"
      :class="{
        'min-w-2xs sm:min-w-full': isLg
      }"
    >
      <slot name="subtitle" />

      <div
        class="flex items-center h-full gap-4"
        :class="{
          'justify-between': isLg
        }"
      >
        <AppSpinner v-if="isLoading" />

        <div
          v-else
          class="rounded-full mr-4 flex items-center justify-center bg-gray-600 group-hover:bg-blue-850 link-count-number"
          :class="[isLg ? 'min-w-12 w-12 h-12' : 'w-4 h-4 md:w-6 md:h-6']"
        >
          <slot name="icon" />
        </div>

        <slot />
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
a.router-link-active {
  @apply border-blue-500 rounded-b-md opacity-100 rounded-none;
}
.router-link-active .link-count-number {
  @apply bg-blue-500 text-blue-900;
}
</style>

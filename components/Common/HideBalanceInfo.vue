<script setup lang="ts">
const appStore = useAppStore()
</script>

<template>
  <span class="relative inline-block">
    <span
      :class="{
        invisible: appStore.userState.preferences.isHideBalances
      }"
    >
      <slot />
    </span>
    <span
      v-if="appStore.userState.preferences.isHideBalances"
      class="absolute inset-0 flex items-center justify-end"
    >
      ******
    </span>
  </span>
</template>

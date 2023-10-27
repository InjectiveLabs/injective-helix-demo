<script setup lang="ts">
const isOpen = ref(true)

function toggleAdvancedSettings() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div>
    <div
      class="flex justify-between items-center select-none"
      @click="toggleAdvancedSettings"
    >
      <p class="font-semibold text-sm">{{ $t('sgt.advancedSettings') }}</p>
      <div
        class="transition-all duration-300"
        :class="{ 'rotate-180': isOpen }"
      >
        <BaseIcon name="chevron-down" is-md />
      </div>
    </div>

    <div v-if="isOpen" class="space-y-2 my-4 text-sm">
      <div class="flex justify-between">
        <p>{{ $t('sgt.numberOfGrids') }}</p>
        <p>100</p>
      </div>
      <div class="flex justify-between">
        <p>{{ $t('sgt.lowerPrice') }}</p>
        <p>100</p>
      </div>
      <div class="flex justify-between">
        <p>{{ $t('sgt.upperPrice') }}</p>
        <p>100</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  dataCy: {
    type: String,
    default: 'unknown-id'
  }
})
</script>

<template>
  <SharedCheckbox v-bind="$attrs">
    <template #checkbox="{ isChecked, isDisabled }">
      <div class="grid place-items-center">
        <div class="relative w-4 h-4">
          <div
            class="absolute inset-0 border border-white"
            :class="{ 'bg-gray-500': isDisabled }"
          >
            <div
              v-if="isChecked"
              class="absolute left-1/2 top-0 bottom-0 right-0 border-transparent border-[1.5px] rotate-45 scale-75 border-r-white border-b-white -translate-x-[0.2rem] -translate-y-0.5"
            />
          </div>
        </div>
      </div>
    </template>
    <span class="text-xs select-none" :data-cy="dataCy">
      <slot />
    </span>
  </SharedCheckbox>
</template>

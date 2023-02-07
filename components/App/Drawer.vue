<script lang="ts" setup>
const isOpen = ref(true)

function handleToggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div>
    <div
      class="group flex justify-end w-full cursor-pointer relative"
      @click.stop="handleToggle"
    >
      <div class="max-w-full flex-1 pr-5">
        <slot name="header" />
      </div>
      <div class="absolute right-0 top-0">
        <BaseIcon
          name="caret-down"
          class="text-gray-500 group-hover:text-gray-200 w-4 h-4"
          :class="{
            'transform rotate-180': isOpen
          }"
        />
      </div>
    </div>
    <div v-if="isOpen">
      <slot />
    </div>
  </div>
</template>

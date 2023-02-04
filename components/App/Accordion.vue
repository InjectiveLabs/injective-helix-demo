<script lang="ts" setup>
defineProps({
  isOpen: Boolean,
  sm: Boolean
})

const emit = defineEmits<{
  (e: 'togglePanel'): void
}>()

function handleToggle() {
  emit('togglePanel')
}
</script>

<template>
  <div :class="{ 'pt-6': !sm, 'py-2 px-6': sm }">
    <dt class="text-lg">
      <button
        class="text-left w-full flex justify-between items-start text-gray-200"
        :class="{
          'items-center': sm
        }"
        :aria-expanded="isOpen"
        @click.stop="handleToggle"
      >
        <div class="font-semibold text-gray-200 flex items-start">
          <slot name="title" />
          <slot name="badge" />
        </div>
        <span class="ml-6 h-6 flex items-center">
          <svg
            class="transform"
            :class="{
              'h-6 w-6': !sm,
              'h-4 w-4': sm,
              'rotate-180': isOpen
            }"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>
    </dt>
    <dd
      v-show="isOpen"
      class="mt-2"
      :class="{
        'pr-12': !sm
      }"
    >
      <slot name="content" />
    </dd>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  isSm: Boolean,
  isOpen: Boolean
})

const emit = defineEmits<{
  'panel:toggle': []
}>()

function handleToggle() {
  emit('panel:toggle')
}
</script>

<template>
  <div
    :class="{
      'pt-6': !isSm,
      'py-2 px-6': isSm
    }"
  >
    <dt class="text-lg">
      <button
        class="text-left w-full flex justify-between items-start text-gray-200"
        :class="{
          'items-center': isSm
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
              'h-6 w-6': !isSm,
              'h-4 w-4': isSm,
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
        'pr-12': !isSm
      }"
    >
      <slot name="content" />
    </dd>
  </div>
</template>

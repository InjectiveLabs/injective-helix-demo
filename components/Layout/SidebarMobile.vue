<script lang="ts" setup>
const { width } = useWindowSize()

defineProps<{
  isOpenSidebar: Boolean
}>()

const emit = defineEmits<{
  (e: 'sidebar:closed'): void
}>()

function handleSidebarClose() {
  emit('sidebar:closed')
}

watchDebounced(
  width,
  (newWidth, oldWidth) => {
    if (oldWidth && newWidth >= 640) {
      handleSidebarClose()
    }
  },
  { debounce: 200, immediate: true }
)
</script>

<template>
  <div class="lg:hidden">
    <div
      class="fixed inset-0 flex top-[48px]"
      :class="{ 'z-1100': isOpenSidebar }"
      @click="handleSidebarClose"
    >
      <transition
        enter-from-class="-translate-x-full"
        enter-active-class="transition ease-in-out duration-300 transform"
        enter-to-class="translate-x-0"
        leave-active-class="transition ease-in-out duration-300 transform"
        leave-from-class="translate-x-0"
        leave-to-class="-translate-x-full"
      >
        <div
          v-if="isOpenSidebar"
          class="relative flex-1 flex flex-col w-full pt-5 pb-4 bg-gray-900 max-w-xs"
        >
          <div
            class="flex flex-col h-0 flex-1"
            @click.stop="handleSidebarClose"
          >
            <div class="flex-1 flex flex-col overflow-y-auto">
              <LayoutNav />
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

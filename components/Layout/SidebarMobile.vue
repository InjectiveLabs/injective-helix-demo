<script lang="ts" setup>
const { width } = useWindowSize()

const zIndex = ref(0)

withDefaults(defineProps<{ isOpenSidebar?: boolean }>(), {
  isOpenSidebar: false
})

const emit = defineEmits<{
  'sidebar:closed': []
}>()

function closeSidebar() {
  emit('sidebar:closed')
}

watchDebounced(
  width,
  (newWidth, oldWidth) => {
    if (oldWidth && newWidth >= 640) {
      closeSidebar()
    }
  },
  { debounce: 200, immediate: true }
)
</script>

<template>
  <div class="lg:hidden">
    <div
      class="fixed inset-0 flex top-[48px]"
      :style="{
        zIndex
      }"
      @click="closeSidebar"
    >
      <transition
        enter-from-class="-translate-x-full"
        enter-active-class="transition ease-in-out duration-300 transform"
        enter-to-class="translate-x-0"
        leave-active-class="transition ease-in-out duration-300 transform"
        leave-from-class="translate-x-0"
        leave-to-class="-translate-x-full"
        @before-enter="zIndex = 40"
        @after-leave="zIndex = 0"
      >
        <div
          v-if="isOpenSidebar"
          class="relative flex-1 flex flex-col w-full pt-5 pb-4 bg-coolGray-900 max-w-xs"
        >
          <div class="flex flex-col h-0 flex-1" @click.stop="closeSidebar">
            <div class="flex-1 flex flex-col overflow-y-auto">
              <LayoutNav />
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

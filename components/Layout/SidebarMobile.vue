<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'sidebar:closed'): void
}>()

function closeSidebar() {
  emit('sidebar:closed')
}
</script>

<template>
  <div class="lg:hidden">
    <div class="fixed inset-0 max-w-xs flex z-1100 top-[48px]">
      <transition
        enter-active-class="transition ease-in-out duration-300 transform"
        enter-class="-translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition ease-in-out duration-300 transform"
        leave-class="translate-x-0"
        leave-to-class="-translate-x-full"
      >
        <div
          ref="sidebar"
          class="relative flex-1 flex flex-col w-full pt-5 pb-4 bg-gray-900"
        >
          <LayoutSidebarContent @click="closeSidebar" />
        </div>
      </transition>
    </div>
  </div>
</template>

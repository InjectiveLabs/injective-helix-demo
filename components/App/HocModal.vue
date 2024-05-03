<script setup lang="ts">
const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits<{
  'modal:close': []
}>()

const isLocked = useScrollLock(document.body)
const isLockedDoc = useScrollLock(document.documentElement)

watch(
  () => props.isOpen,
  (isOpen) => {
    isLocked.value = isOpen
    isLockedDoc.value = isOpen
  },
  {
    immediate: true
  }
)

function closeModal() {
  emit('modal:close')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-in-out"
      leave-active-class="transition duration-300 ease-in-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed backdrop-blur inset-0 bg-gray-900/20 z-50 md:grid md:place-items-center md:p-4"
        @click="closeModal"
      >
        <div
          class="overflow-y-auto max-md:h-[100dvh] md:max-h-[90dvh] bg-gray-900/80 rounded-md border border-brand-700 md:max-w-[600px] w-full flex flex-col"
          @click.stop
        >
          <div class="md:hidden p-4 flex justify-end">
            <SharedIcon name="close" @click="closeModal" />
          </div>

          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

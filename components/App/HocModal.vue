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
  (value) => {
    isLocked.value = value
    isLockedDoc.value = value
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
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 z-50 md:grid md:place-items-center md:p-4"
      @click="closeModal"
    >
      <div
        class="max-md:h-[100dvh] bg-brand-900 p-4 rounded-md border md:max-w-[600px] w-full flex flex-col"
        @click.stop
      >
        <div class="h-full overflow-y-auto">
          <div class="md:hidden p-4 flex justify-end">
            <BaseIcon name="close" @click="closeModal" />
          </div>

          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'

const props = withDefaults(defineProps<{ isOpen: boolean }>(), {
  isOpen: false
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
        class="fixed backdrop-blur inset-0 bg-coolGray-900/20 z-50 md:grid md:place-items-center md:p-4"
        @click="closeModal"
      >
        <div
          class="overflow-y-auto max-md:h-[100vh] md:max-h-[90vh] bg-coolGray-900/90 rounded-md border border-brand-700 md:max-w-[600px] w-full flex flex-col"
          @click.stop
        >
          <div class="md:hidden p-4 flex justify-end">
            <UIcon
              :name="NuxtUiIcons.Close"
              class="h-6 w-6 min-w-6"
              @click="closeModal"
            />
          </div>

          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

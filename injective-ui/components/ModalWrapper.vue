<script setup lang="ts">
import { onKeyStroke, onClickOutside } from '@vueuse/core'

const props = defineProps({
  isLoading: Boolean,

  ignore: {
    type: Array as PropType<string[]>,
    default: () => []
  },

  containerClass: {
    type: String,
    default: ''
  },

  wrapperClass: {
    type: String,
    default: 'bg-gray-900 bg-opacity-80'
  }
})

const emit = defineEmits<{
  'modal:open': []
  'modal:closed': []
}>()

onMounted(() => {
  emit('modal:open')
})

const modalRef = ref(null)

function onModalClose() {
  closeModal()
}

function closeModal() {
  emit('modal:closed')
}

onKeyStroke('Escape', closeModal)

onClickOutside(
  modalRef,
  () => {
    closeModal()
  },
  {
    ignore: ['.modal-content', ...props.ignore]
  }
)
</script>
<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 h-full w-full duration-300 ease-in"
    :class="wrapperClass"
  >
    <div class="flex items-center justify-center h-full">
      <div
        ref="modalRef"
        class="modal-container overflow-y-hidden"
        :class="$attrs.class"
      >
        <div
          class="max-h-screen sm:max-h-[90vh] overflow-y-auto"
          :class="containerClass"
        >
          <div class="modal-content">
            <slot :close="onModalClose" v-bind="{ isLoading }" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

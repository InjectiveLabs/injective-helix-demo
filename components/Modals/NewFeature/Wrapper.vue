<script lang="ts" setup>
import { RouteLocationNamedRaw } from 'vue-router'
import { Modal } from '@/types'

const route = useRoute()
const modalStore = useModalStore()

defineProps({
  to: {
    type: Object as PropType<RouteLocationNamedRaw>,
    default: () => ({
      name: 'index'
    })
  }
})

const isModalOpen = computed(() => modalStore.modals[Modal.NewFeature])

onMounted(() => {
  if (route.name === 'index') {
    init()
  }
})

function init() {
  const DELAY_MODAL_DISPLAY_TIME = 3 * 1000

  setTimeout(() => {
    modalStore.openModal(Modal.NewFeature)
  }, DELAY_MODAL_DISPLAY_TIME)
}

function handleClose() {
  modalStore.closeModal(Modal.NewFeature)
}
</script>

<template>
  <AppModal
    :is-open="isModalOpen"
    sm
    v-bind="{ hideCloseButton: true, dense: true }"
    @modal:closed="handleClose"
  >
    <div class="flex flex-col justify-center items-center max-h-modal">
      <div w-full h-auto>
        <slot name="image" />
      </div>

      <div class="p-6 w-full text-center overflow-y-auto pb-10">
        <div class="mb-4 font-bold leading-5">
          <slot name="title" />
        </div>

        <div class="mb-4 text-sm flex flex-col gap-4 leading-5">
          <slot name="description" />
        </div>

        <NuxtLink
          class="font-semibold whitespace-nowrap w-full text-sm text-white bg-blue-500 rounded p-3 block leading-4"
          :to="to"
          @click="handleClose"
        >
          <slot name="cta" />
        </NuxtLink>

        <AppButton
          class="flex items-center justify-center md:hidden font-semibold whitespace-nowrap w-full text-sm text-white bg-gray-700 rounded p-3 mt-4"
          @click="handleClose"
        >
          Close
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>

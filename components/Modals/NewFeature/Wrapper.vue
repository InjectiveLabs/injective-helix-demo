<script lang="ts" setup>
import { RouteLocationNamedRaw } from 'vue-router'
import { Modal } from '@/types'

const route = useRoute()
const slots = useSlots()
const appStore = useAppStore()
const modalStore = useModalStore()

const props = defineProps({
  to: {
    type: Object as PropType<RouteLocationNamedRaw>,
    default: () => ({
      name: 'index'
    })
  },

  modal: {
    required: true,
    type: String as PropType<Modal>
  }
})

const isModalOpen = computed(
  () =>
    modalStore.modals[props.modal] &&
    !appStore.userState.modalsViewed.includes(props.modal)
)

onMounted(() => {
  if (route.name === 'index') {
    init()
  }
})

function init() {
  const DELAY_MODAL_DISPLAY_TIME = 3 * 1000

  setTimeout(() => {
    modalStore.openModal(props.modal)
  }, DELAY_MODAL_DISPLAY_TIME)
}

function closeModal() {
  modalStore.closeModal(props.modal)

  appStore.setUserState({
    ...appStore.userState,
    modalsViewed: [...appStore.userState.modalsViewed, props.modal]
  })
}
</script>

<template>
  <AppModal
    :is-open="isModalOpen"
    sm
    v-bind="{ hideCloseButton: true, dense: true }"
    @modal:closed="closeModal"
  >
    <div class="flex flex-col justify-center items-center max-h-modal">
      <div w-full h-auto>
        <slot name="image" />
      </div>

      <div class="p-6 w-full text-center overflow-y-auto pb-10">
        <div class="mb-4 font-bold leading-5">
          <slot name="title" />
        </div>

        <div class="text-sm flex flex-col gap-4 leading-5">
          <slot name="description" />
        </div>

        <NuxtLink
          v-if="slots.cta"
          class="font-semibold whitespace-nowrap w-full text-sm text-white bg-blue-500 rounded p-3 block leading-4 mt-4"
          :to="to"
          @click="closeModal"
        >
          <slot name="cta" />
        </NuxtLink>

        <AppButton
          class="flex items-center justify-center md:hidden font-semibold whitespace-nowrap w-full text-sm text-white bg-gray-700 rounded p-3 mt-4"
          @click="closeModal"
        >
          Close
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>

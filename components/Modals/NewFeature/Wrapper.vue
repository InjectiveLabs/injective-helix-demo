<script lang="ts" setup>
import { RouteLocationNamedRaw } from 'vue-router'
import { NuxtUiIcons } from '@shared/types'
import { Modal, MainPage } from '@/types'

const route = useRoute()
const slots = useSlots()
const appStore = useAppStore()
const modalStore = useSharedModalStore()

const props = withDefaults(
  defineProps<{
    modal: Modal
    route1?: RouteLocationNamedRaw
    route2?: RouteLocationNamedRaw
  }>(),
  {
    route1: () => ({
      name: MainPage.Index
    }),
    route2: () => ({
      name: MainPage.Index
    })
  }
)

const isModalOpen = computed(
  () =>
    modalStore.modals[props.modal] &&
    !appStore.userState.modalsViewed.includes(props.modal)
)

onMounted(() => {
  if (
    route.name === MainPage.Index &&
    !appStore.userState.modalsViewed.includes(props.modal)
  ) {
    init()
  }
})

function init() {
  const DELAY_MODAL_DISPLAY_TIME = 3 * 1000

  setTimeout(() => {
    appStore.setUserState({
      ...appStore.userState,
      modalsViewed: [...appStore.userState.modalsViewed, Modal.LeaderboardTerms]
    })

    modalStore.openModal(props.modal)
  }, DELAY_MODAL_DISPLAY_TIME)
}

function onCloseModal() {
  modalStore.closeModal(props.modal)

  appStore.setUserState({
    ...appStore.userState,
    modalsViewed: [...appStore.userState.modalsViewed, props.modal]
  })
}
</script>

<template>
  <AppModal
    v-bind="{
      isSm: true,
      isDense: true,
      isOpen: isModalOpen,
      isHideCloseButton: true
    }"
    @modal:closed="onCloseModal"
  >
    <div class="flex flex-col justify-center items-center max-h-modal">
      <div class="w-full h-auto">
        <slot name="image" />
        <div class="absolute right-0 top-0 mt-2 mr-2">
          <UIcon
            :name="NuxtUiIcons.Close"
            class="ml-auto h-5 w-5 min-w-5 text-coolGray-200 hover:text-blue-500"
            @click="onCloseModal"
          />
        </div>
      </div>

      <div class="p-6 w-full text-center overflow-y-auto">
        <div class="mb-4 text-xl font-semibold leading-5">
          <slot name="title" />
        </div>

        <div class="text-sm flex flex-col gap-4 leading-5">
          <slot name="description" />
        </div>

        <div
          v-if="slots.countdown"
          class="flex items-center justify-center gap-4 leading-5 text-xl font-semibold"
        >
          <UIcon
            :name="NuxtUiIcons.ArrowLeft"
            class="h-4 w-4 rotate-180 text-blue-500"
          />
          <slot name="countdown" />
          <UIcon :name="NuxtUiIcons.ArrowLeft" class="h-4 w-4 text-blue-500" />
        </div>

        <NuxtLink
          v-if="slots.cta1"
          class="font-semibold whitespace-nowrap w-full text-sm text-blue-900 bg-blue-500 rounded p-3 block leading-4 mt-4"
          :to="route1"
          @click="onCloseModal"
        >
          <slot name="cta1" />
        </NuxtLink>

        <NuxtLink
          v-if="slots.cta2"
          class="font-semibold whitespace-nowrap w-full text-sm text-blue-900 bg-blue-500 rounded p-3 block leading-4 mt-4"
          :to="route2"
          @click="onCloseModal"
        >
          <slot name="cta2" />
        </NuxtLink>

        <AppButton
          v-if="!(slots.cta1 || slots.cta2)"
          class="flex items-center justify-center font-semibold whitespace-nowrap w-full text-sm bg-blue-500 text-blue-900 rounded p-3 mt-6"
          @click="onCloseModal"
        >
          {{ $t('banners.newFeature.close') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>

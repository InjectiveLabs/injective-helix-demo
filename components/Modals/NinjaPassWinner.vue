<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { Modal } from '@/types'

const appStore = useAppStore()
const confetti = useSharedConfetti()
const modalStore = useSharedModalStore()
const ninjaPassStore = useNinjaPassStore()
const sharedWalletStore = useSharedWalletStore()

const ninjaPassCode = computed(() => {
  if (!ninjaPassStore.codes) {
    return
  }

  return ninjaPassStore.codes[0]
})

const ninjaPassUrl = computed(() => {
  if (!ninjaPassCode.value) {
    return
  }

  return `https://ninjapass.injective.com/?code=${ninjaPassCode.value.code}&address=${sharedWalletStore.injectiveAddress}`
})

watch(
  () => ninjaPassCode,
  (code) => {
    if (
      code &&
      !appStore.userState.modalsViewed.includes(Modal.NinjaPassWinner)
    ) {
      modalStore.openModal(Modal.NinjaPassWinner)
      confetti.showConfetti()
    }
  }
)

onWalletConnected(() => {
  ninjaPassStore.fetchCodes()
})

function closeModal() {
  modalStore.closeModal(Modal.NinjaPassWinner)
  appStore.setUserState({
    ...appStore.userState,
    modalsViewed: [...appStore.userState.modalsViewed, Modal.NinjaPassWinner]
  })
}
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.NinjaPassWinner]"
    v-bind="{ isHideCloseButton: true }"
    @on:close="closeModal"
  >
    <template #title>
      <h3 class="normal-case">
        {{ $t('common.modal.ninjaPass.congratulations') }}
      </h3>
    </template>

    <div class="flex flex-col">
      <span class="text-sm mb-4">
        {{ $t('common.modal.ninjaPass.title') }}
      </span>
      <span class="text-sm">
        {{ $t('common.modal.ninjaPass.description') }}
      </span>

      <div class="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2 text-sm">
        <a
          :href="ninjaPassUrl"
          target="_blank"
          class="bg-blue-500 py-2 h-10 rounded border flex items-center justify-center gap-2 cursor-pointer"
        >
          <span class="font-semibold text-blue-900">
            {{ $t('common.modal.ninjaPass.verifyNow') }}
          </span>
          <UIcon
            :name="NuxtUiIcons.ExternalLink"
            class="w-4 h-4 text-blue-900"
          />
        </a>

        <button
          class="bg-transparent py-2 h-10 rounded border border-blue-100"
          @click="closeModal"
        >
          <span class="font-semibold text-blue-100">
            {{ $t('common.modal.ninjaPass.later') }}
          </span>
        </button>
      </div>
    </div>
  </AppModal>
</template>

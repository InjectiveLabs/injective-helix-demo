<script lang="ts" setup>
import { Modal } from '@/types'

const appStore = useAppStore()
const walletStore = useWalletStore()
const ninjaPassStore = useNinjaPassStore()
const modalStore = useModalStore()
const confetti = useConfetti()

const userState = computed(() => {
  return appStore.userState
})

const isUserWalletConnected = computed(() => {
  return walletStore.isUserWalletConnected
})

const injectiveAddress = computed(() => {
  return walletStore.injectiveAddress
})

const codes = computed(() => {
  return ninjaPassStore.codes
})

const isModalOpen = computed(() => {
  if (!modalStore.modals) {
    return false
  }

  return modalStore.modals[Modal.NinjaPassWinner]
})

const hasCodes = computed(() => {
  if (!codes.value) {
    return false
  }

  return codes.value.length > 0
})

const ninjaPassCode = computed(() => {
  if (!codes.value || codes.value.length === 0) {
    return
  }

  const [code] = codes.value

  return code
})

const ninjaPassUrl = computed(() => {
  if (!ninjaPassCode.value) {
    return
  }

  return `https://ninjapass.injective.com/?code=${ninjaPassCode.value.code}&address=${injectiveAddress.value}`
})

const hasSeenNinjaPassWinnerModal = computed(() => {
  return appStore.userState.ninjaPassWinnerModalViewed
})

watch(
  () => isUserWalletConnected,
  (val) => {
    if (val) {
      ninjaPassStore.fetchCodes()
    }
  }
)

watch(
  () => hasCodes,
  (val) => {
    if (val && !hasSeenNinjaPassWinnerModal) {
      modalStore.openModal({ type: Modal.NinjaPassWinner })

      confetti.showConfetti()
    }
  }
)

onMounted(() => {
  if (isUserWalletConnected) {
    ninjaPassStore.fetchCodes()
  }
})

function closeModal() {
  modalStore.closeModal(Modal.NinjaPassWinner)

  appStore.setUserState({
    ...userState.value,
    ninjaPassWinnerModalViewed: true
  })
}
</script>

<template>
  <div>
    <AppModalWrapper
      :show="isModalOpen"
      sm
      hide-close-button
      @modal:closed="closeModal"
    >
      <template #title>
        <h3 class="normal-case">
          {{ $t('ninjaPass.congratulations') }}
        </h3>
      </template>

      <div class="flex flex-col">
        <span class="text-sm mb-4">
          {{ $t('ninjaPass.title') }}
        </span>
        <span class="text-sm">
          {{ $t('ninjaPass.description') }}
        </span>
        <div class="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2">
          <a
            :href="ninjaPassUrl"
            target="_blank"
            class="bg-blue-300 py-2 h-10 rounded border border-blue-300 flex items-center justify-center gap-2"
          >
            <span class="font-medium text-white">
              {{ $t('ninjaPass.verifyNow') }}
            </span>
            <BaseIcon name="external-link" class="w-4 h-4 text-white" />
          </a>

          <button
            class="bg-transparent py-2 h-10 rounded border border-white"
            @click="closeModal"
          >
            <span class="font-medium text-white">
              {{ $t('ninjaPass.later') }}
            </span>
          </button>
        </div>
      </div>
    </AppModalWrapper>
  </div>
</template>

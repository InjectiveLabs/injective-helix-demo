<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { NuxtUiIcons } from '@shared/types'
import { Modal, PortfolioStatusKey } from '@/types'

const modalStore = useSharedModalStore()
const accountStore = useAccountStore()
const sharedWalletStore = useSharedWalletStore()

const isBannerVisible = ref(true)

function hideBanner() {
  isBannerVisible.value = false
}

const hasBalance = computed(() => {
  if (!sharedWalletStore.isUserConnected) {
    return true
  }

  if (portfolioStatus.isLoading()) {
    return true
  }

  return (
    portfolioStatus.isIdle() && Object.keys(accountStore.balancesMap).length > 0
  )
})

const portfolioStatus = inject(
  PortfolioStatusKey,
  new Status(StatusType.Loading)
)

function openDepositQrModal() {
  modalStore.openModal(Modal.FiatOnboard)
}
</script>

<template>
  <div
    v-if="isBannerVisible && !hasBalance"
    class="bg-blue-400 text-blue-900 flex items-center px-3 py-1.5 text-sm justify-between relative z-40"
  >
    <div />

    <button class="hover:text-white" @click="openDepositQrModal">
      <div class="flex items-center space-x-2">
        <p>{{ $t('globalBanner.title') }}</p>

        <UIcon
          :name="NuxtUiIcons.ArrowLeft"
          class="h-4 w-4 min-w-4 rotate rotate-180"
        />
      </div>
    </button>

    <UIcon
      :name="NuxtUiIcons.Close"
      class="h-4 w-4 min-w-4 hover:text-white"
      @click="hideBanner"
    />
  </div>
</template>

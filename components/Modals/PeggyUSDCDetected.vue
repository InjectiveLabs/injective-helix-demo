<script lang="ts" setup>
import { Modal } from '@/types'

const router = useRouter()
const modalStore = useModalStore()

function handleClose() {
  modalStore.closeModal(Modal.USDCDetected)
}

function handleNavigation() {
  router.push({ name: 'account' })
}
</script>

<template>
  <AppModalWrapper
    :show="modalStore.modals[Modal.USDCDetected]"
    sm
    @modal:closed="handleClose"
  >
    <template #title>
      <h3>
        {{ $t('trade.usdcLegacyBalanceDetected') }}
      </h3>
    </template>

    <div class="flex flex-col gap-4">
      <span class="text-sm font-semibold">
        {{ $t('trade.haveLegacyUSDC') }}
      </span>
      <AppButton
        type="button"
        class="whitespace-nowrap w-full bg-blue-500 text-black"
        @click="handleNavigation"
      >
        <div class="flex items-center justify-center">
          <span class="text-white">{{ $t('trade.viewUSDC') }}</span>
        </div>
      </AppButton>
    </div>
  </AppModalWrapper>
</template>

<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal } from '@/types'

const modalStore = useModalStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()

const status = reactive(new Status(StatusType.Idle))
const { $onError } = useNuxtApp()

const hasActiveStrategyForSubaccount = computed(() =>
  gridStrategyStore.activeStrategies.find(
    (strategy) => strategy.subaccountId === accountStore.subaccountId
  )
)

onWalletConnected(() => {
  status.setLoading()

  Promise.all([gridStrategyStore.fetchAllStrategies()])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})

function transferToMainSubaccount() {
  status.setLoading()

  Promise.all([accountStore.withdrawToMain()])
    .then(() => {
      // modalStore.closeModal(Modal.TransferToMainSubaccount)
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function onCloseModal() {
  modalStore.closeModal(Modal.TransferToMainSubaccount)
}
</script>

<template>
  <AppModal
    is-md
    :is-open="modalStore.modals[Modal.TransferToMainSubaccount]"
    @modal:closed="onCloseModal"
  >
    <div>
      <AppHocLoading v-bind="{ status }">
        <div v-if="hasActiveStrategyForSubaccount">
          <div class="flex justify-center pb-4">
            <BaseIcon name="info" class="w-10 h-10 text-gray-500" />
          </div>

          <h3 class="mb-8 font-semibold">
            This subaccount has a running SGT Strategy, if you want to transfer
            your funds to main subaccount, you need to stop the bot.
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AppButton
              is-lg
              class="w-full shadow-none select-none text-red-500 border-red-500"
            >
              {{ $t('sgt.cancel') }}
            </AppButton>

            <AppButton
              is-lg
              class="w-full shadow-none select-none text-white-500 border-red-500 bg-red-500"
            >
              {{ $t('sgt.endBot') }}
            </AppButton>
          </div>
        </div>

        <div v-else>
          <div class="flex justify-center pb-4">
            <BaseIcon name="info" class="w-10 h-10 text-gray-500" />
          </div>

          <h3 class="mb-8 font-semibold">
            This action will transfer all your funds to the main subaccount.
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AppButton
              is-lg
              class="w-full shadow-none select-none text-red-500 border-red-500"
            >
              {{ $t('sgt.cancel') }}
            </AppButton>
            <AppButton
              is-lg
              class="w-full shadow-none select-none text-white border-blue-500 bg-blue-500"
              @click="transferToMainSubaccount"
            >
              {{ $t('sgt.confirm') }}
            </AppButton>
          </div>
        </div>
      </AppHocLoading>
    </div>
  </AppModal>
</template>

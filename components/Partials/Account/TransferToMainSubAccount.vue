<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal } from '@/types'

const modalStore = useModalStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()

const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

function transferToMainSubaccount() {
  status.setLoading()

  Promise.all([accountStore.withdrawToMain()])
    .then(() => {})
    .catch($onError)
    .finally(() => {
      status.setIdle()
      modalStore.closeModal(Modal.TransferToMainSubaccount)
    })
}

const hasActiveStrategyForSubaccount = computed(() =>
  gridStrategyStore.activeStrategies.find(
    (strategy) => strategy.subaccountId === accountStore.subaccountId
  )
)

function onClick() {
  if (hasActiveStrategyForSubaccount.value) {
    modalStore.openModal(Modal.TransferToMainSubaccount)
    return
  }

  transferToMainSubaccount()
}
</script>

<template>
  <AppButton
    v-bind="{ status }"
    class="border border-blue-500"
    @click="onClick"
  >
    <span class="text-blue-500 font-semibold">
      {{ $t('account.transferToMainSubaccount') }}
    </span>
  </AppButton>

  <ModalsSubaccountTransferToMainSubaccount />
</template>

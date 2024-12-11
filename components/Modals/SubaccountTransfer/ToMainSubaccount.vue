<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal } from '@/types'

const modalStore = useSharedModalStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))

const activeStrategy = computed(() =>
  gridStrategyStore.activeStrategies.find(
    (strategy) => strategy.subaccountId === accountStore.subaccountId
  )
)

function onEndBot() {
  if (!activeStrategy.value) {
    return
  }

  status.setLoading()

  Promise.all([
    gridStrategyStore.removeStrategyForSubaccount(
      activeStrategy.value.contractAddress
    )
  ])
    .then(() => notificationStore.success({ title: t('common.success') }))
    .catch($onError)
    .finally(() => {
      status.setIdle()
      modalStore.closeModal(Modal.TransferToMainSubaccount)
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
    <template #title>
      <h3>
        {{ $t('account.subaccountTransfer') }}
      </h3>
    </template>

    <div>
      <div>
        <h3 class="mb-8 font-semibold">
          {{ $t('sgt.accountEndBot') }}
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AppButton class="w-full" v-bind="{ status }" is-lg @click="onEndBot">
            {{ $t('sgt.endBot') }}
          </AppButton>

          <AppButton
            variant="danger-outline"
            class="w-full"
            is-lg
            @click="onCloseModal"
          >
            {{ $t('sgt.cancel') }}
          </AppButton>
        </div>
      </div>
    </div>
  </AppModal>
</template>

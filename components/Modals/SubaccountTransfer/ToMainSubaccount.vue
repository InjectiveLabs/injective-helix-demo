<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal } from '@/types'

const accountStore = useAccountStore()
const modalStore = useSharedModalStore()
const gridStrategyStore = useGridStrategyStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

const activeStrategy = computed(() =>
  gridStrategyStore.activeSpotStrategies.find(
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
    .then(() =>
      notificationStore.update({
        title: t('toast.tradingBots.tradingBotRemovedSuccessfully')
      })
    )
    .catch($onError)
    .finally(() => {
      status.setIdle()
      onCloseModal()
    })
}

function onCloseModal() {
  modalStore.closeModal(Modal.TransferToMainSubaccount)
}
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.TransferToMainSubaccount]"
    v-bind="{ isMd: true }"
  >
    <template #title>
      <h3>
        {{ $t('common.account.subaccountTransfer') }}
      </h3>
    </template>

    <div>
      <div>
        <h3 class="mb-8 font-semibold">
          {{ $t('portfolio.subaccounts.accountEndBot') }}
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AppButton v-bind="{ status }" is-lg class="w-full" @click="onEndBot">
            {{ $t('tradingBots.endBot') }}
          </AppButton>

          <AppButton
            is-lg
            class="w-full"
            variant="danger-outline"
            @click="onCloseModal"
          >
            {{ $t('common.cancel') }}
          </AppButton>
        </div>
      </div>
    </div>
  </AppModal>
</template>

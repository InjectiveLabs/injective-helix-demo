<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal } from '@/types'

const modalStore = useModalStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
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
    .then(() => {
      success({ title: t('common.success') })
    })
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
    <div>
      <div>
        <div class="flex justify-center pb-4">
          <BaseIcon name="info" class="w-10 h-10 text-gray-500" />
        </div>

        <h3 class="mb-8 font-semibold">
          {{ $t('sgt.accountEndBot') }}
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AppButton
            is-lg
            class="w-full shadow-none select-none text-red-500 border-red-500"
            @click="onCloseModal"
          >
            {{ $t('sgt.cancel') }}
          </AppButton>

          <AppButton
            v-bind="{ status }"
            is-lg
            class="w-full shadow-none select-none text-white-500 border-red-500 bg-red-500"
            @click="onEndBot"
          >
            {{ $t('sgt.endBot') }}
          </AppButton>
        </div>
      </div>
    </div>
  </AppModal>
</template>

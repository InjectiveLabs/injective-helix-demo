<script lang="ts" setup>
import { getExplorerUrl } from '@injectivelabs/sdk-ui-ts'
import { NETWORK } from '@/app/utils/constants'
import { getHubUrl } from '@/app/utils/helpers'
import { BridgeForm, Modal } from '@/types'

const modalStore = useModalStore()
const walletStore = useWalletStore()

const hubUrl = `${getHubUrl()}/bridge`

const formValues = useFormValues<BridgeForm>() as Ref<BridgeForm>
const resetForm = useResetForm()

const { isDeposit, isTransfer, isWithdraw } = useBridgeState(formValues)

const explorerUrl = computed(
  () => `${getExplorerUrl(NETWORK)}/account/${walletStore.injectiveAddress}/`
)

const isModalOpen = computed(() => modalStore.modals[Modal.BridgeCompleted])

const isOnChainTransaction = computed(
  () => isWithdraw.value || isTransfer.value
)

function handleModalClose() {
  resetForm()

  modalStore.closeModal(Modal.BridgeCompleted)
}
</script>

<template>
  <AppModal
    :show="isModalOpen"
    sm
    data-cy="transfer-completed-modal"
    @modal:closed="handleModalClose"
  >
    <template #title>
      <h3>
        <span v-if="isDeposit">
          {{ $t('bridge.depositToInjective') }}
        </span>
        <span v-if="isWithdraw">
          {{ $t('bridge.withdrawFromInjective') }}
        </span>
        <span v-if="isTransfer">
          {{ $t('bridge.withdrawFromInjective') }}
        </span>
      </h3>
    </template>

    <div>
      <h3 class="text-xl font-semibold mt-6">
        {{ $t('bridge.transactionConfirmed') }}
      </h3>
      <p class="mt-4 text-gray-300">
        <span>
          {{ $t('bridge.withdrawFromEthereumNote') }}
        </span>
      </p>
      <div class="flex items-center justify-between mt-6 gap-4">
        <AppButton
          class="w-full font-semibold rounded bg-blue-500 text-blue-900"
          data-cy="transfer-completed-modal-ok-button"
          lg
          @click="handleModalClose"
        >
          {{ $t('common.ok') }}
        </AppButton>
        <div class="text-primary-500 cursor-pointer w-full">
          <NuxtLink
            v-if="isOnChainTransaction"
            :to="explorerUrl"
            target="_blank"
            data-cy="transfer-completed-modal-explorer-link"
          >
            <div class="flex items-center justify-center gap-1">
              <span>{{ $t('bridge.seeOnExplorer') }}</span>
              <BaseIcon name="external-link" class="w-3 h-3" />
            </div>
          </NuxtLink>

          <NuxtLink v-else :to="hubUrl" target="_blank">
            <div class="flex items-center justify-center gap-1">
              <span data-cy="transfer-completed-hub-track-link">
                {{ $t('bridge.trackTransaction') }}
              </span>
              <BaseIcon name="external-link" class="w-3 h-3" />
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </AppModal>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import { getExplorerUrl } from '@injectivelabs/sdk-ui-ts'
import { NETWORK } from '@/app/utils/constants'
import { getHubUrl } from '@/app/utils/helpers'
import { Modal, BridgeField, BridgeForm, BridgeType } from '@/types'

const modalStore = useModalStore()
const walletStore = useWalletStore()

const props = defineProps({
  bridgeType: {
    type: String as PropType<BridgeType>,
    required: true
  },

  formValues: {
    required: true,
    type: Object as PropType<BridgeForm>
  }
})

const emit = defineEmits<{
  (e: 'form:reset'): void
}>()

const {
  destinationIsInjective,
  isTransfer,
  isWithdraw,
  networkIsNotSupported
} = useBridgeNetwork({
  bridgeForm: computed(() => props.formValues),
  bridgeType: computed(() => props.bridgeType)
})

const hubUrl = `${getHubUrl()}/bridge`
const explorerUrl = `${getExplorerUrl(NETWORK)}/account/${
  walletStore.injectiveAddress
}/`

const isOnChainTransaction = computed(
  () => isTransfer.value || (isWithdraw.value && destinationIsInjective.value)
)

function close() {
  emit('form:reset')

  modalStore.closeModal(Modal.BridgeCompleted)
}
</script>

<template>
  <AppModalWrapper
    :show="modalStore.modals[Modal.BridgeCompleted]"
    sm
    data-cy="transfer-completed-modal"
    @modal:closed="close"
  >
    <template #title>
      <h3>
        <span v-if="bridgeType === BridgeType.Deposit">
          {{ $t('bridge.depositToInjective') }}
        </span>
        <span v-else-if="bridgeType === BridgeType.Withdraw">
          {{ $t('bridge.withdrawFromInjective') }}
        </span>
        <span v-else>
          {{ $t('bridge.transferFromToTradingAccount') }}
        </span>
      </h3>
    </template>

    <div>
      <div v-if="walletStore.isUserWalletConnected">
        <div v-if="!networkIsNotSupported">
          <h3 class="text-xl font-semibold mt-6">
            {{ $t('bridge.transactionConfirmed') }}
          </h3>
          <p class="mt-4 text-gray-300">
            <span v-if="bridgeType === BridgeType.Transfer">
              {{ $t('bridge.defaultNote') }}
            </span>
            <span v-else>
              {{ $t('bridge.withdrawFromEthereumNote') }}
            </span>
          </p>
          <div class="flex items-center justify-between mt-6 gap-4">
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

            <AppButton
              class="w-full font-semibold rounded bg-blue-500 text-blue-900"
              data-cy="transfer-completed-modal-ok-button"
              lg
              @click="close"
            >
              {{ $t('common.ok') }}
            </AppButton>
          </div>
        </div>

        <ModalsBridgeNotSupportedBridgeTypeNote
          v-else
          v-bind="{
            formValues,
            selectedNetwork: formValues[BridgeField.BridgingNetwork],
            bridgeType
          }"
        />
      </div>
      <CommonUserNotConnectedNote v-else />
    </div>
  </AppModalWrapper>
</template>

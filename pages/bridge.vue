<script setup lang="ts">
import { BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { injToken } from '@/app/data/token'
import { BridgeField, BridgeForm, BridgeType, Modal } from '@/types'

definePageMeta({
  middleware: ['connected']
})

const walletStore = useWalletStore()
const modalStore = useModalStore()
const peggyStore = usePeggyStore()
const accountStore = useAccountStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

const { values: formValues } = useForm<BridgeForm>({
  initialValues: {
    [BridgeField.BridgingNetwork]: BridgingNetwork.Ethereum,
    [BridgeField.BridgeType]: BridgeType.Deposit,
    [BridgeField.Token]: injToken,
    [BridgeField.Denom]: injToken.denom,
    [BridgeField.Amount]: '',
    [BridgeField.Memo]: '',
    [BridgeField.Destination]: ''
  },
  keepValuesOnUnmount: true
})
const { isDeposit } = useBridgeState(computed(() => formValues))

onMounted(() => {
  fetchData()
  handlePreFillCosmosWallet()
})

function fetchData() {
  status.setLoading()

  Promise.all([
    accountStore.fetchAccountPortfolio(),
    peggyStore.getErc20BalancesWithTokenAndPrice()
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function handlePreFillCosmosWallet() {
  if (walletStore.isCosmosWallet) {
    formValues[BridgeField.BridgingNetwork] = BridgingNetwork.CosmosHub
  }
}

function handleBridgeConfirmed() {
  modalStore.closeModal(Modal.BridgeConfirm)
}
</script>

<template>
  <div class="grid place-items-center h-full">
    <div class="max-w-xl w-[320px] sm:w-[440px] lg:w-[640px]">
      <div>
        <div class="flex justify-start mb-6 gap-2">
          <AppSelectButton
            v-model="formValues[BridgeField.BridgeType]"
            :value="BridgeType.Deposit"
            class="text-xs uppercase tracking-wide cursor-pointer"
            :class="[
              formValues[BridgeField.BridgeType] === BridgeType.Deposit
                ? 'text-blue-500'
                : 'text-gray-500'
            ]"
          >
            <span>
              {{ $t('account.deposit') }}
            </span>
          </AppSelectButton>
          <CommonSeparator />
          <AppSelectButton
            v-model="formValues[BridgeField.BridgeType]"
            :value="BridgeType.Withdraw"
            class="text-xs uppercase tracking-wide cursor-pointer"
            :class="[
              formValues[BridgeField.BridgeType] === BridgeType.Withdraw
                ? 'text-blue-500'
                : 'text-gray-500'
            ]"
          >
            <span>
              {{ $t('account.withdraw') }}
            </span>
          </AppSelectButton>
        </div>
      </div>
      <div class="p-6 bg-gray-850 rounded-lg">
        <AppHocLoading v-bind="{ status }">
          <PartialsBridgeFormNetworkSelect>
            <template #title>
              <span v-if="isDeposit">
                {{ $t('bridge.selectOriginNetwork') }}
              </span>
              <span v-else>
                {{ $t('bridge.selectDestinationNetwork') }}
              </span>
            </template>
          </PartialsBridgeFormNetworkSelect>
          <PartialsBridge />
          <ModalsBridgeConfirm @form:submit="handleBridgeConfirmed" />
          <ModalsBridgeCompleted />
        </AppHocLoading>
      </div>
    </div>
  </div>
</template>

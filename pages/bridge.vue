<script setup lang="ts">
import { BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { TokenType } from '@injectivelabs/token-metadata'
import { injToken } from '@/app/data/token'
import { BridgeField, BridgeForm, BridgeType, Modal } from '@/types'
import { getDenomAndTypeFromQuery } from '@/app/data/bridge'

definePageMeta({
  middleware: ['connected']
})

const route = useRoute()
const walletStore = useWalletStore()
const modalStore = useModalStore()
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
const { isDeposit, isWithdraw, isTransfer } = useBridgeState(
  computed(() => formValues)
)

onMounted(() => {
  status.setLoading()

  Promise.all([accountStore.fetchAccountPortfolio()])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })

  handlePreFillCosmosWallet()
  handlePreFillFromQuery()
})

function handlePreFillCosmosWallet() {
  if (walletStore.isCosmosWallet) {
    formValues[BridgeField.BridgingNetwork] = BridgingNetwork.CosmosHub
  }
}

function handlePreFillFromQuery() {
  if (!route.query) {
    return
  }

  const { denom, bridgeType, tokenType } = getDenomAndTypeFromQuery(route.query)

  formValues[BridgeField.BridgeType] = bridgeType

  switch (true) {
    case tokenType === TokenType.Erc20 && denom.startsWith('peggy'):
      formValues[BridgeField.BridgingNetwork] = BridgingNetwork.Ethereum
      formValues[BridgeField.Denom] = denom
      break
    case tokenType === TokenType.Ibc:
      formValues[BridgeField.BridgingNetwork] = BridgingNetwork.CosmosHub
      break
    case tokenType === TokenType.Cw20 || tokenType === TokenType.TokenFactory:
      formValues[BridgeField.BridgingNetwork] = BridgingNetwork.EthereumWh
      break
    case tokenType === TokenType.Spl:
      formValues[BridgeField.BridgingNetwork] = BridgingNetwork.Solana
      break
    default:
      formValues[BridgeField.BridgingNetwork] = BridgingNetwork.Ethereum
      formValues[BridgeField.Denom] = denom
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
          <CommonSeparator />
          <AppSelectButton
            v-model="formValues[BridgeField.BridgeType]"
            :value="BridgeType.Transfer"
            class="text-xs uppercase tracking-wide cursor-pointer"
            :class="[
              formValues[BridgeField.BridgeType] === BridgeType.Transfer
                ? 'text-blue-500'
                : 'text-gray-500'
            ]"
          >
            <span>
              {{ $t('account.transferOnChain') }}
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
              <span v-if="isWithdraw">
                {{ $t('bridge.selectDestinationNetwork') }}
              </span>
              <span v-if="isTransfer">
                {{ $t('bridge.transferOnChain') }}
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

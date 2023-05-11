<script lang="ts" setup>
import { BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { injToken } from '@/app/data/token'
import { isTokenWormholeToken } from '@/app/data/bridge'
import { Modal, BridgeForm, BridgeField } from '@/types'
import { BridgeType } from '@/types/enums'

const modalStore = useModalStore()
const walletStore = useWalletStore()

const { values: formValues } = useForm<BridgeForm>({
  initialValues: {
    [BridgeField.BridgingNetwork]: BridgingNetwork.Ethereum,
    [BridgeField.Token]: injToken,
    [BridgeField.Denom]: injToken.denom,
    [BridgeField.Amount]: '',
    [BridgeField.Memo]: '',
    [BridgeField.Destination]: '',
    [BridgeField.BridgeType]: BridgeType.Deposit
  },
  keepValuesOnUnmount: true
})

onMounted(() => {
  handlePreFillCosmosWallet()
})

function handlePreFillCosmosWallet() {
  if (walletStore.isCosmosWallet) {
    formValues[BridgeField.BridgingNetwork] = BridgingNetwork.CosmosHub
  }
}

function handleBridgeConfirmation() {
  nextTick(() => {
    modalStore.closeModal(Modal.Bridge)
    modalStore.openModal({ type: Modal.BridgeConfirm })

    if (isTokenWormholeToken(formValues[BridgeField.Token])) {
      formValues[BridgeField.BridgingNetwork] = BridgingNetwork.EthereumWh
    }
  })
}

function handleBridgeConfirmed() {
  modalStore.closeModal(Modal.BridgeConfirm)
  modalStore.openModal({ type: Modal.BridgeCompleted })
}
</script>

<template>
  <div>
    <ModalsBridge @bridge:confirmation="handleBridgeConfirmation" />
    <ModalsBridgeConfirm @form:submit="handleBridgeConfirmed" />
    <ModalsBridgeCompleted />
  </div>
</template>

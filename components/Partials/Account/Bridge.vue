<script lang="ts" setup>
import type { Token } from '@injectivelabs/token-metadata'
import { BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { injToken } from '@/app/data/token'
import {
  getBridgingNetworkBySymbol,
  isTokenWormholeToken
} from '@/app/data/bridge'
import {
  Modal,
  BridgeForm,
  BridgeType,
  BridgeField,
  BridgeBusEvents,
  TransferDirection
} from '@/types'

const accountStore = useAccountStore()
const modalStore = useModalStore()
const peggyStore = usePeggyStore()
const walletStore = useWalletStore()

const { resetForm: resetBridgeForm, values: formValues } = useForm<BridgeForm>({
  initialValues: {
    [BridgeField.BridgingNetwork]: BridgingNetwork.Ethereum,
    [BridgeField.TransferDirection]: TransferDirection.bankToTradingAccount,
    [BridgeField.BridgeType]: BridgeType.Transfer,
    [BridgeField.Token]: injToken,
    [BridgeField.Denom]: injToken.denom,
    [BridgeField.Amount]: '',
    [BridgeField.Memo]: '',
    [BridgeField.Destination]: ''
  },
  keepValuesOnUnmount: true
})

onMounted(() => {
  handlePreFillCosmosWallet()

  useEventBus<Token | undefined>(BridgeBusEvents.Deposit).on(handleDeposit)
  useEventBus<Token | undefined>(BridgeBusEvents.Withdraw).on(handleWithdraw)
  useEventBus<Token | undefined>(BridgeBusEvents.Transfer).on(handleTransfer)
  useEventBus<Token | undefined>(BridgeBusEvents.TransferToBank).on(
    handleTransferToBank
  )
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

function resetForm(token?: Token) {
  resetBridgeForm()

  formValues[BridgeField.BridgeType] = BridgeType.Transfer

  if (token) {
    formValues[BridgeField.Token] = token
    formValues[BridgeField.Denom] = token.denom
  }
}

function handleBridgeConfirmed() {
  modalStore.closeModal(Modal.BridgeConfirm)
  modalStore.openModal({ type: Modal.BridgeCompleted })
}

function handleTransfer(token: Token = injToken) {
  resetForm(token)

  formValues[BridgeField.BridgeType] = BridgeType.Transfer
  formValues[BridgeField.TransferDirection] =
    TransferDirection.bankToTradingAccount

  if (!accountStore.hasEnoughInjForGas) {
    return modalStore.openModal({ type: Modal.InsufficientInjForGas })
  }

  modalStore.openModal({ type: Modal.Bridge })
}

function handleTransferToBank(token: Token = injToken) {
  resetForm(token)

  formValues[BridgeField.BridgeType] = BridgeType.Transfer
  formValues[BridgeField.TransferDirection] =
    TransferDirection.tradingAccountToBank

  modalStore.openModal({ type: Modal.Bridge })
}

function handleDeposit(token: Token = injToken) {
  resetForm(token)

  formValues[BridgeField.BridgeType] = BridgeType.Deposit
  formValues[BridgeField.BridgingNetwork] = getBridgingNetworkBySymbol(
    token.symbol
  )
  formValues[BridgeField.TransferDirection] =
    TransferDirection.tradingAccountToBank

  // Update ERC20 balances when we open the bridge instead of loading them when we open the page
  peggyStore.updateErc20BalancesWithTokenAndPrice()

  modalStore.openModal({ type: Modal.Bridge })
}

function handleWithdraw(token: Token = injToken) {
  resetForm(token)

  const bridgingNetworkValue = getBridgingNetworkBySymbol(token.symbol)

  formValues[BridgeField.BridgeType] = BridgeType.Withdraw
  formValues[BridgeField.BridgingNetwork] = bridgingNetworkValue
  formValues[BridgeField.TransferDirection] =
    TransferDirection.tradingAccountToBank

  modalStore.openModal({ type: Modal.Bridge })
}
</script>

<template>
  <div>
    <ModalsBridge @bridge:confirmation="handleBridgeConfirmation" />
    <ModalsBridgeConfirm @form:submit="handleBridgeConfirmed" />
    <ModalsBridgeCompleted />
  </div>
</template>

<script lang="ts" setup>
import { BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import {
  Modal,
  BridgeType,
  BridgeField,
  BridgeBusEvents,
  TransferDirection
} from '@/types'
import { injToken } from '@/app/data/token'
import { denomClient } from '@/app/Services'
import { getBridgingNetworkBySymbol } from '@/app/data/bridge'

const walletStore = useWalletStore()
const bankStore = useBankStore()
const tokenStore = useTokenStore()
const modalStore = useModalStore()
const { query } = useRoute()

const { form, resetForm, bridgeType } = useBridgeState()

onMounted(() => {
  handleQueryParams()
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
    form[BridgeField.BridgingNetwork] = BridgingNetwork.CosmosHub
  }
}

function handleBridgeInit() {
  nextTick(() => {
    modalStore.closeModal(Modal.Bridge)
    modalStore.openModal({ type: Modal.BridgeConfirm })
  })
}

function handleBridgeConfirmed() {
  resetForm()

  modalStore.closeModal(Modal.BridgeConfirm)
  modalStore.openModal({ type: Modal.BridgeCompleted })
}

function handleTransfer(token: Token = injToken) {
  resetForm(token)

  bridgeType.value = BridgeType.Transfer
  form[BridgeField.TransferDirection] = TransferDirection.bankToTradingAccount

  if (!bankStore.hasEnoughInjForGas) {
    return modalStore.openModal({ type: Modal.InsufficientInjForGas })
  }

  modalStore.openModal({ type: Modal.Bridge })
}

function handleTransferToBank(token: Token = injToken) {
  resetForm(token)

  bridgeType.value = BridgeType.Transfer
  form[BridgeField.TransferDirection] = TransferDirection.tradingAccountToBank

  modalStore.openModal({ type: Modal.Bridge })
}

function handleDeposit(token: Token = injToken) {
  resetForm(token)

  bridgeType.value = BridgeType.Deposit

  form[BridgeField.BridgingNetwork] = getBridgingNetworkBySymbol(token.symbol)
  form[BridgeField.TransferDirection] = TransferDirection.tradingAccountToBank

  // Update ERC20 balances when we open the bridge instead of loading them when we open the page
  tokenStore.updateErc20TokensWithBalanceAndPrice()

  modalStore.openModal({ type: Modal.Bridge })
}

function handleWithdraw(token: Token = injToken) {
  resetForm(token)

  const bridgingNetworkValue = getBridgingNetworkBySymbol(token.symbol)

  bridgeType.value = BridgeType.Withdraw
  form[BridgeField.BridgingNetwork] = bridgingNetworkValue
  form[BridgeField.TransferDirection] = TransferDirection.tradingAccountToBank

  modalStore.openModal({ type: Modal.Bridge })
}

// TODO: Refactor
function handleQueryParams() {
  const { denom, bridgeType: bridgeTypeFromQuery } = query as {
    denom: string
    bridgeType: BridgeType
  }

  if (!denom || !bridgeTypeFromQuery) {
    return
  }

  const token = denomClient.getDenomToken(denom)

  if (!token) {
    return
  }

  resetForm(token)
  bridgeType.value = bridgeTypeFromQuery

  modalStore.openModal({ type: Modal.Bridge })
}
</script>

<template>
  <div>
    <ModalsBridge
      v-bind="{
        form,
        bridgeType
      }"
      @bridge:init="handleBridgeInit"
    />

    <ModalsBridgeConfirm @form:submit="handleBridgeConfirmed" />
    <ModalsBridgeCompleted />
  </div>
</template>

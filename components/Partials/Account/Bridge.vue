<script lang="ts" setup>
import { BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import {
  BridgeField,
  BridgeForm,
  BridgeFormValue,
  BridgeType,
  Modal,
  BridgeBusEvents,
  TransferDirection
} from '@/types'
import { injToken, usdcTokenDenom } from '@/app/data/token'
import { denomClient } from '@/app/Services'
import { getBridgingNetworkBySymbol } from '@/app/data/bridge'

const walletStore = useWalletStore()
const bankStore = useBankStore()
const tokenStore = useTokenStore()
const modalStore = useModalStore()
const { query } = useRoute()

const bridgeType = ref(BridgeType.Transfer)

const {
  errors,
  setFieldValue,
  resetForm,
  values: formValues
} = useForm<BridgeForm>({
  initialValues: {
    [BridgeField.BridgingNetwork]: BridgingNetwork.Ethereum,
    [BridgeField.TransferDirection]: TransferDirection.bankToTradingAccount,
    [BridgeField.Token]: injToken,
    [BridgeField.Denom]: '',
    [BridgeField.Amount]: '',
    [BridgeField.Memo]: '',
    [BridgeField.Destination]: ''
  }
})

/*
  allow rendering token option in bridge dropdown
  despite user not having that token in his bank/subaccount
*/
const cachedTokens = ref<Token[]>([injToken])
const cachedFormValues = ref<BridgeForm>(formValues)
const hasFormErrors = computed(() => Object.keys(errors.value).length > 0)

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

function updateFormValue({ field, value }: BridgeFormValue) {
  setFieldValue(field, value)
}

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

  handleResetForm(token)
  bridgeType.value = bridgeTypeFromQuery

  modalStore.openModal({ type: Modal.Bridge })
}

function handlePreFillCosmosWallet() {
  if (walletStore.isCosmosWallet) {
    formValues[BridgeField.BridgingNetwork] = BridgingNetwork.CosmosHub
  }
}

function handleBridgeInitiated() {
  cachedFormValues.value = Object.assign({}, formValues)

  nextTick(() => {
    modalStore.closeModal(Modal.Bridge)
    modalStore.openModal({ type: Modal.BridgeConfirm })
  })
}

function handleBridgeConfirmed() {
  handleResetForm()

  modalStore.closeModal(Modal.BridgeConfirm)
  modalStore.openModal({ type: Modal.BridgeCompleted })
}

function handleResetForm(token: Token = injToken) {
  if (!cachedTokens.value.some(({ denom }) => denom === token.denom)) {
    cachedTokens.value = [...cachedTokens.value, token]
  }

  resetForm()

  setFieldValue(BridgeField.Token, token)
  setFieldValue(BridgeField.Denom, token.denom)
}

function handleTransfer(token: Token = injToken) {
  handleResetForm(token)

  bridgeType.value = BridgeType.Transfer
  formValues[BridgeField.TransferDirection] =
    TransferDirection.bankToTradingAccount

  if (!bankStore.hasEnoughInjForGas) {
    return modalStore.openModal({ type: Modal.InsufficientInjForGas })
  }

  modalStore.openModal({ type: Modal.Bridge })
}

function handleTransferToBank(token: Token = injToken) {
  handleResetForm(token)

  bridgeType.value = BridgeType.Transfer
  formValues[BridgeField.TransferDirection] =
    TransferDirection.tradingAccountToBank

  modalStore.openModal({ type: Modal.Bridge })
}

function handleDeposit(token: Token = injToken) {
  const formToken = token || injToken

  handleResetForm(formToken)

  bridgeType.value = BridgeType.Deposit

  const bridgingNetworkBySymbol = getBridgingNetworkBySymbol(formToken.symbol)

  const bridgingNetworkValue =
    walletStore.isCosmosWallet &&
    bridgingNetworkBySymbol !== BridgingNetwork.Solana &&
    ![usdcTokenDenom.USDCso].includes(formToken.denom.toLowerCase())
      ? BridgingNetwork.CosmosHub
      : bridgingNetworkBySymbol

  formValues[BridgeField.BridgingNetwork] = bridgingNetworkValue
  formValues[BridgeField.TransferDirection] =
    TransferDirection.tradingAccountToBank

  // Update ERC20 balances when we open the bridge instead of loading them when we open the page
  tokenStore.updateErc20TokensBalanceAndAllowanceFromBankAndMarkets()

  modalStore.openModal({ type: Modal.Bridge })
}

function handleWithdraw(token: Token = injToken) {
  const formToken = token || injToken
  const bridgingNetworkValue = walletStore.isCosmosWallet
    ? BridgingNetwork.CosmosHub
    : getBridgingNetworkBySymbol(formToken.symbol)

  handleResetForm(formToken)

  bridgeType.value = BridgeType.Withdraw
  formValues[BridgeField.BridgingNetwork] = bridgingNetworkValue
  formValues[BridgeField.TransferDirection] =
    TransferDirection.tradingAccountToBank

  modalStore.openModal({ type: Modal.Bridge })
}
</script>

<template>
  <div>
    <ModalsBridge
      v-bind="{
        bridgeType,
        cachedTokens,
        hasFormErrors,
        formValues
      }"
      @form:update="updateFormValue"
      @form:reset="handleResetForm"
      @form:submit="handleBridgeInitiated"
    />

    <ModalsBridgeConfirm
      v-bind="{
        bridgeType,
        formValues: cachedFormValues
      }"
      @form:submit="handleBridgeConfirmed"
    />

    <ModalsBridgeCompleted
      v-bind="{
        bridgeType,
        formValues: cachedFormValues
      }"
      @form:reset="handleResetForm"
    />
  </div>
</template>

import { BridgingNetwork, KeplrNetworks } from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import { injToken } from '@/app/data/token'
import {
  BridgeField,
  BridgeForm,
  BridgeType,
  TransferDirection,
  TransferSide
} from '@/types'
import { networksMeta, transferSideMeta } from '@/app/data/bridge'

export const getInitialBridgeFormValues = () => ({
  [BridgeField.BridgingNetwork]: BridgingNetwork.Ethereum,
  [BridgeField.TransferDirection]: TransferDirection.bankToTradingAccount,
  [BridgeField.Token]: injToken,
  [BridgeField.Denom]: injToken.denom,
  [BridgeField.Amount]: '',
  [BridgeField.Memo]: '',
  [BridgeField.Destination]: ''
})

const form = reactive<BridgeForm>(getInitialBridgeFormValues())
const bridgeType = ref(BridgeType.Transfer)

const isWithdraw = computed(() => bridgeType.value === BridgeType.Withdraw)
const isDeposit = computed(() => bridgeType.value === BridgeType.Deposit)
const isTransfer = computed(() => bridgeType.value === BridgeType.Transfer)

const isBankToTradingAccount = computed(
  () =>
    form[BridgeField.TransferDirection] ===
    TransferDirection.bankToTradingAccount
)

const origin = computed<BridgingNetwork | TransferDirection>(() => {
  switch (bridgeType.value) {
    case BridgeType.Deposit:
      return form[BridgeField.BridgingNetwork]
    case BridgeType.Withdraw:
      return BridgingNetwork.Injective
    default:
      return form[BridgeField.TransferDirection]
  }
})

const destination = computed<BridgingNetwork | TransferDirection>(() => {
  switch (bridgeType.value) {
    case BridgeType.Deposit:
      return BridgingNetwork.Injective
    case BridgeType.Withdraw:
      return form[BridgeField.BridgingNetwork]
    default:
      return isBankToTradingAccount.value
        ? TransferDirection.tradingAccountToBank
        : TransferDirection.bankToTradingAccount
  }
})

const originNetworkMeta = computed(() => {
  switch (bridgeType.value) {
    case BridgeType.Deposit:
      return networksMeta.find(
        (meta) => meta.value === form[BridgeField.BridgingNetwork]
      )
    case BridgeType.Withdraw:
      return networksMeta.find(
        (meta) => meta.value === BridgingNetwork.Injective
      )
    default:
      return isBankToTradingAccount.value
        ? transferSideMeta[TransferSide.Bank]
        : transferSideMeta[TransferSide.TradingAccount]
  }
})

const destinationNetworkMeta = computed(() => {
  switch (bridgeType.value) {
    case BridgeType.Deposit:
      return networksMeta.find(
        (meta) => meta.value === BridgingNetwork.Injective
      )
    case BridgeType.Withdraw:
      return networksMeta.find(
        (meta) => meta.value === form[BridgeField.BridgingNetwork]
      )
    default:
      return isBankToTradingAccount.value
        ? transferSideMeta[TransferSide.TradingAccount]
        : transferSideMeta[TransferSide.Bank]
  }
})

const destinationIsEthereum = computed(() => {
  return destination.value === BridgingNetwork.Ethereum
})

const destinationIsInjective = computed(() => {
  return destination.value === BridgingNetwork.Injective
})

const originIsInjective = computed(() => {
  return origin.value === BridgingNetwork.Injective
})

const originIsEthereum = computed(() => {
  return origin.value === BridgingNetwork.Ethereum
})

const isIbcTransfer = computed(() => {
  const cosmosNetworks = [
    ...KeplrNetworks,
    BridgingNetwork.Terra,
    BridgingNetwork.Crescent
  ]

  return (
    cosmosNetworks.includes(origin.value as BridgingNetwork) ||
    cosmosNetworks.includes(destination.value as BridgingNetwork)
  )
})

const networkIsNotSupported = computed(() => {
  const notSupportedNetworks = [
    ...KeplrNetworks,
    BridgingNetwork.Terra,
    BridgingNetwork.Axelar,
    BridgingNetwork.Moonbeam,
    BridgingNetwork.Crescent,
    BridgingNetwork.Solana,
    BridgingNetwork.EthereumWh
  ]

  return (
    notSupportedNetworks.includes(origin.value as BridgingNetwork) ||
    notSupportedNetworks.includes(destination.value as BridgingNetwork)
  )
})

function resetForm(token: Token = injToken) {
  Object.assign(form, getInitialBridgeFormValues())
  bridgeType.value = BridgeType.Transfer

  form[BridgeField.Token] = token
  form[BridgeField.Denom] = token.denom
}

export default function useBridgeState() {
  return {
    form,
    resetForm,
    isDeposit,
    isWithdraw,
    bridgeType,
    isTransfer,
    isIbcTransfer,
    originIsEthereum,
    originNetworkMeta,
    originIsInjective,
    destinationIsEthereum,
    networkIsNotSupported,
    destinationIsInjective,
    destinationNetworkMeta,
    isBankToTradingAccount
  }
}

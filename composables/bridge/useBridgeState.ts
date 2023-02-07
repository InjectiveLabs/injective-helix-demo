import type { Ref } from 'vue'
import { BridgingNetwork, KeplrNetworks } from '@injectivelabs/sdk-ui-ts'
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

export default function useBridgeState({
  formValues
}: {
  formValues: Ref<Partial<BridgeForm>>
}) {
  const isWithdraw = computed(
    () => formValues.value[BridgeField.BridgeType] === BridgeType.Withdraw
  )
  const isDeposit = computed(
    () => formValues.value[BridgeField.BridgeType] === BridgeType.Deposit
  )
  const isTransfer = computed(
    () => formValues.value[BridgeField.BridgeType] === BridgeType.Transfer
  )

  const isBankToTradingAccount = computed(
    () =>
      formValues.value[BridgeField.TransferDirection] ===
      TransferDirection.bankToTradingAccount
  )

  const origin = computed<BridgingNetwork | TransferDirection>(() => {
    switch (formValues.value[BridgeField.BridgeType]) {
      case BridgeType.Deposit:
        return formValues.value[BridgeField.BridgingNetwork]
      case BridgeType.Withdraw:
        return BridgingNetwork.Injective
      default:
        return formValues.value[BridgeField.TransferDirection]
    }
  })

  const destination = computed<BridgingNetwork | TransferDirection>(() => {
    switch (formValues.value[BridgeField.BridgeType]) {
      case BridgeType.Deposit:
        return BridgingNetwork.Injective
      case BridgeType.Withdraw:
        return formValues.value[BridgeField.BridgingNetwork]
      default:
        return isBankToTradingAccount.value
          ? TransferDirection.tradingAccountToBank
          : TransferDirection.bankToTradingAccount
    }
  })

  const originNetworkMeta = computed(() => {
    switch (formValues.value[BridgeField.BridgeType]) {
      case BridgeType.Deposit:
        return networksMeta.find(
          (meta) => meta.value === formValues.value[BridgeField.BridgingNetwork]
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
    switch (formValues.value[BridgeField.BridgeType]) {
      case BridgeType.Deposit:
        return networksMeta.find(
          (meta) => meta.value === BridgingNetwork.Injective
        )
      case BridgeType.Withdraw:
        return networksMeta.find(
          (meta) => meta.value === formValues.value[BridgeField.BridgingNetwork]
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

  return {
    isDeposit,
    isWithdraw,
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

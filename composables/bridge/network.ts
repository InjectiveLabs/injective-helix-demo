import type { Ref } from 'vue'
import { BridgingNetwork, KeplrNetworks } from '@injectivelabs/sdk-ui-ts'
import { networksMeta, transferSideMeta } from '@/app/data/bridge'
import {
  BridgeField,
  BridgeForm,
  BridgeType,
  TransferDirection,
  TransferSide
} from '@/types'

export function useBridgeNetwork({
  bridgeForm,
  bridgeType
}: {
  bridgeType: Ref<BridgeType>
  bridgeForm: Ref<BridgeForm>
}) {
  const isWithdraw = computed(() => bridgeType.value === BridgeType.Withdraw)
  const isDeposit = computed(() => bridgeType.value === BridgeType.Deposit)
  const isTransfer = computed(() => bridgeType.value === BridgeType.Transfer)

  const isBankToTradingAccount = computed(
    () =>
      bridgeForm.value[BridgeField.TransferDirection] ===
      TransferDirection.bankToTradingAccount
  )

  const origin = computed<BridgingNetwork | TransferDirection>(() => {
    switch (bridgeType.value) {
      case BridgeType.Deposit:
        return bridgeForm.value[BridgeField.BridgingNetwork]
      case BridgeType.Withdraw:
        return BridgingNetwork.Injective
      default:
        return bridgeForm.value[BridgeField.TransferDirection]
    }
  })

  const destination = computed<BridgingNetwork | TransferDirection>(() => {
    switch (bridgeType.value) {
      case BridgeType.Deposit:
        return BridgingNetwork.Injective
      case BridgeType.Withdraw:
        return bridgeForm.value[BridgeField.BridgingNetwork]
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
          (meta) => meta.value === bridgeForm.value[BridgeField.BridgingNetwork]
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
          (meta) => meta.value === bridgeForm.value[BridgeField.BridgingNetwork]
        )
      default:
        return isBankToTradingAccount.value
          ? transferSideMeta[TransferSide.TradingAccount]
          : transferSideMeta[TransferSide.Bank]
    }
  })

  const destinationIsEthereumNetwork = computed(() => {
    return destination.value === BridgingNetwork.Ethereum
  })

  const destinationIsInjective = computed(() => {
    return destination.value === BridgingNetwork.Injective
  })

  const originIsInjectiveNetwork = computed(() => {
    return origin.value === BridgingNetwork.Injective
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
      BridgingNetwork.Solana
    ]

    return (
      notSupportedNetworks.includes(origin.value as BridgingNetwork) ||
      notSupportedNetworks.includes(destination.value as BridgingNetwork)
    )
  })

  return {
    destinationIsEthereumNetwork,
    destinationIsInjective,
    destinationNetworkMeta,
    isBankToTradingAccount,
    isDeposit,
    isIbcTransfer,
    isTransfer,
    isWithdraw,
    networkIsNotSupported,
    originIsInjectiveNetwork,
    originNetworkMeta
  }
}

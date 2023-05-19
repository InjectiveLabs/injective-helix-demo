import type { Ref } from 'vue'
import { BridgingNetwork, KeplrNetworks } from '@injectivelabs/sdk-ui-ts'
import { BridgeField, BridgeForm, BridgeType } from '@/types'
import { networksMeta } from '@/app/data/bridge'

export default function useBridgeState(formValues: Ref<BridgeForm>) {
  const isWithdraw = computed(
    () => formValues.value[BridgeField.BridgeType] === BridgeType.Withdraw
  )
  const isDeposit = computed(
    () => formValues.value[BridgeField.BridgeType] === BridgeType.Deposit
  )
  const isTransfer = computed(
    () => formValues.value[BridgeField.BridgeType] === BridgeType.Transfer
  )

  const origin = computed<BridgingNetwork>(() => {
    return formValues.value[BridgeField.BridgeType] === BridgeType.Deposit
      ? formValues.value[BridgeField.BridgingNetwork]
      : BridgingNetwork.Injective
  })

  const destination = computed<BridgingNetwork>(() => {
    return formValues.value[BridgeField.BridgeType] === BridgeType.Deposit
      ? BridgingNetwork.Injective
      : formValues.value[BridgeField.BridgingNetwork]
  })

  const originNetworkMeta = computed(() => {
    if (formValues.value[BridgeField.BridgeType] === BridgeType.Deposit) {
      return networksMeta.find(
        (meta) => meta.value === formValues.value[BridgeField.BridgingNetwork]
      )
    }

    return networksMeta.find((meta) => meta.value === BridgingNetwork.Injective)
  })

  const destinationNetworkMeta = computed(() => {
    if (formValues.value[BridgeField.BridgeType] === BridgeType.Deposit) {
      return networksMeta.find(
        (meta) => meta.value === BridgingNetwork.Injective
      )
    }

    return networksMeta.find(
      (meta) => meta.value === formValues.value[BridgeField.BridgingNetwork]
    )
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

  const networkIsSupported = computed(() => {
    const notSupportedNetworks = [
      ...KeplrNetworks,
      BridgingNetwork.Terra,
      BridgingNetwork.Axelar,
      BridgingNetwork.Moonbeam,
      BridgingNetwork.Crescent,
      BridgingNetwork.Solana,
      BridgingNetwork.EthereumWh,
      BridgingNetwork.Arbitrum
    ]

    return !notSupportedNetworks.some(
      (network) => network === origin.value || network === destination.value
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
    networkIsSupported,
    destinationIsInjective,
    destinationNetworkMeta
  }
}

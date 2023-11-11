import type { Ref } from 'vue'
import {
  BridgingNetwork,
  CosmosNetworks,
  KeplrNetworks
} from '@injectivelabs/sdk-ui-ts'
import { BridgeField, BridgeForm, BridgeType } from '@/types'
import { networksMeta } from '@/app/data/bridge'

export default function useBridgeState(formValues: Ref<BridgeForm>) {
  const ibcStore = useIbcStore()

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

  const originIsCosmosNetwork = computed(() =>
    CosmosNetworks.includes(origin.value)
  )

  const destinationIsCosmosNetwork = computed(() =>
    CosmosNetworks.includes(destination.value)
  )

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
      BridgingNetwork.Terra,
      BridgingNetwork.Axelar,
      BridgingNetwork.Moonbeam,
      BridgingNetwork.Solana,
      BridgingNetwork.EthereumWh,
      BridgingNetwork.Arbitrum
    ]

    return !notSupportedNetworks.some(
      (network) => network === origin.value || network === destination.value
    )
  })

  const cosmosIbcChannelId = computed(() => {
    if (!ibcStore.channel) {
      return ''
    }

    return originIsInjective.value
      ? ibcStore.channel.bToAChannelId
      : ibcStore.channel.aToBChannelId
  })

  const cosmosIbcInjectiveChannelId = computed(() => {
    if (!ibcStore.channel) {
      return ''
    }

    return ibcStore.channel.bToAChannelId
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
    originIsCosmosNetwork,
    networkIsSupported,
    cosmosIbcChannelId,
    destinationIsInjective,
    destinationNetworkMeta,
    destinationIsCosmosNetwork,
    cosmosIbcInjectiveChannelId
  }
}

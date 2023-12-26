<script lang="ts" setup>
import { BridgingNetwork, CosmosNetworks } from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { TokenType } from '@injectivelabs/token-metadata'
import { WalletException } from '@injectivelabs/exceptions'
import { Wallet } from '@injectivelabs/wallet-ts'
import { injToken } from '@/app/data/token'
import { BridgeField, BridgeForm, BridgeType, Modal } from '@/types'
import { getDenomAndTypeFromQuery, COSMOS_CHAIN_ID } from '@/app/data/bridge'
import {
  getBridgingNetworkFromDenom,
  getNetworkDefaultToken
} from '@/app/client/utils/bridge'

definePageMeta({
  middleware: ['connected']
})

const route = useRoute()
const ibcStore = useIbcStore()
const tokenStore = useTokenStore()
const walletStore = useWalletStore()
const modalStore = useModalStore()
const accountStore = useAccountStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))
const connectCosmosStatus = reactive(new Status(StatusType.Idle))

const { values: formValues, resetForm: resetFormValidation } =
  useForm<BridgeForm>({
    initialValues: {
      [BridgeField.BridgingNetwork]: BridgingNetwork.Ethereum,
      [BridgeField.Denom]: injToken.denom,
      [BridgeField.Amount]: '',
      [BridgeField.Memo]: '',
      [BridgeField.Destination]: ''
    },
    keepValuesOnUnmount: true
  })

const { value: bridgeTypeValue } = useStringField({
  name: BridgeField.BridgeType,
  initialValue: BridgeType.Deposit
})

const setFormValues = useSetFormValues()

const { isDeposit, isWithdraw, isTransfer } = useBridgeState(
  computed(() => formValues)
)

const { balanceWithToken, supplyWithBalance } = useBridgeBalance(
  computed(() => formValues)
)

onMounted(() => {
  Promise.all([
    accountStore.fetchAccountPortfolioBalances(),
    accountStore.streamBankBalance(),
    accountStore.streamSubaccountBalance()
  ])
    .catch($onError)
    .finally(() => status.setIdle())

  if (Object.keys(route.query).length === 0) {
    preFillCosmosWallet()

    return
  }

  preFillFromQuery()
})

onUnmounted(() => {
  accountStore.$reset()
  ibcStore.reset()
})

function resetForm() {
  resetFormValidation({
    values: {
      [BridgeField.BridgingNetwork]: isTransfer.value
        ? BridgingNetwork.Injective
        : formValues[BridgeField.BridgingNetwork],
      [BridgeField.Denom]: formValues[BridgeField.Denom],
      [BridgeField.Amount]: '',
      [BridgeField.Memo]: '',
      [BridgeField.BridgeType]: formValues[BridgeField.BridgeType],
      [BridgeField.Destination]: formValues[BridgeField.Destination]
    }
  })
}

function preFillCosmosWallet() {
  if (walletStore.isCosmosWallet) {
    setFormValues(
      {
        [BridgeField.BridgingNetwork]: BridgingNetwork.CosmosHub
      },
      false
    )

    onConnectCosmosIbc(formValues[BridgeField.BridgingNetwork])
  }
}

function onConnectCosmosIbc(network: BridgingNetwork) {
  /** Ninji is not supported for other cosmos chains */
  if (walletStore.wallet === Wallet.Ninji) {
    return $onError(
      new WalletException(new Error('Ninji is not supported for IBC'))
    )
  }

  ibcStore.reset()
  connectCosmosStatus.setLoading()

  ibcStore
    .connectWithBalances(COSMOS_CHAIN_ID[network])
    .then(() => {
      setFormValues(
        {
          [BridgeField.Denom]: getNetworkDefaultToken(
            ibcStore.balancesWithToken,
            balanceWithToken.value?.token
          ).token.denom
        },
        false
      )
      resetForm()
    })
    .catch($onError)
    .finally(() => {
      connectCosmosStatus.setIdle()
    })
}

function preFillFromQuery() {
  if (!route.query) {
    return
  }

  const { denom, bridgeType, tokenType } = getDenomAndTypeFromQuery(route.query)
  setFormValues(
    {
      [BridgeField.BridgeType]: bridgeType
    },
    false
  )

  switch (true) {
    case tokenType === TokenType.Erc20 && denom.startsWith('peggy'):
      setFormValues(
        {
          [BridgeField.BridgingNetwork]: BridgingNetwork.Ethereum,
          [BridgeField.Denom]: getNetworkDefaultToken(
            supplyWithBalance.value,
            tokenStore.tradeableTokens.find((token) => token.denom === denom)
          ).token.denom
        },
        false
      )
      break
    case tokenType === TokenType.Ibc:
      setFormValues(
        {
          [BridgeField.BridgingNetwork]: getBridgingNetworkFromDenom(denom),
          [BridgeField.Denom]: denom
        },
        false
      )
      onConnectCosmosIbc(formValues[BridgeField.BridgingNetwork])
      break
    case tokenType === TokenType.Cw20 || tokenType === TokenType.TokenFactory:
      setFormValues(
        {
          [BridgeField.BridgingNetwork]: BridgingNetwork.EthereumWh
        },
        false
      )
      break
    case tokenType === TokenType.Spl:
      setFormValues(
        {
          [BridgeField.BridgingNetwork]: BridgingNetwork.Solana
        },
        false
      )
      break
    default:
      setFormValues(
        {
          [BridgeField.BridgingNetwork]: walletStore.isCosmosWallet
            ? BridgingNetwork.CosmosHub
            : BridgingNetwork.Ethereum,
          [BridgeField.Denom]: denom
        },
        false
      )

      if (CosmosNetworks.includes(formValues[BridgeField.BridgingNetwork])) {
        onConnectCosmosIbc(formValues[BridgeField.BridgingNetwork])
      }
  }
}

function onBridgeConfirmed() {
  modalStore.closeModal(Modal.BridgeConfirm)
  resetForm()
}

watch(
  () => formValues.BridgeType,
  (value) => {
    resetForm()
    setFormValues(
      {
        [BridgeField.BridgeType]: value
      },
      false
    )
  }
)
</script>

<template>
  <div class="grid place-items-center h-full">
    <div class="max-w-xl w-[320px] sm:w-[440px] lg:w-[640px]">
      <div>
        <div class="flex justify-start mb-6 gap-2">
          <AppSelectButton
            v-model="bridgeTypeValue"
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
            v-model="bridgeTypeValue"
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
            v-model="bridgeTypeValue"
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
          <PartialsBridgeFormNetworkSelect
            v-bind="{ isDisabled: connectCosmosStatus.isLoading() }"
            @ibc:connect="onConnectCosmosIbc"
          >
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
          <PartialsBridge
            v-bind="{ isConnecting: connectCosmosStatus.isLoading() }"
            @ibc:connect="onConnectCosmosIbc"
          />
          <ModalsBridgeConfirm @form:submit="onBridgeConfirmed" />
          <ModalsBridgeCompleted />
        </AppHocLoading>
      </div>
    </div>
  </div>
</template>

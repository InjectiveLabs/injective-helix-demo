<script lang="ts" setup>
import { BigNumberInBase, Status } from '@injectivelabs/utils'
import {
  ZERO_IN_BASE,
  BalanceWithTokenAndPrice,
  BalanceWithTokenWithErc20BalanceWithPrice
} from '@injectivelabs/sdk-ui-ts'
import { Modal, BridgeField, BridgeForm, BusEvents } from '@/types'
import {
  UI_DEFAULT_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_MINIMAL_AMOUNT
} from '@/app/utils/constants'

const ibcStore = useIbcStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const tokenStore = useTokenStore()
const peggyStore = usePeggyStore()
const modalStore = useModalStore()
const { t } = useLang()
const { success } = useNotifications()
const { $onError } = useNuxtApp()

const formValues = useFormValues<BridgeForm>() as Ref<BridgeForm>

const emit = defineEmits<{
  'form:submit': []
}>()

const {
  isDeposit,
  isWithdraw,
  isTransfer,
  isInjectiveOrigin,
  isEthereumOrigin,
  isCosmosNetworkOrigin,
  originNetworkMeta,
  isEthereumDestination,
  destinationNetworkMeta,
  isCosmosNetworkDestination
} = useBridgeState(formValues)

const { balanceWithToken } = useBridgeBalance(formValues)

const { emit: emitFundingRefresh } = useEventBus<void>(BusEvents.FundingRefresh)

const ETH_BRIDGE_FEE_IN_USD = 20
const IBC_BRIDGE_FEE_IN_USD = 0

const status = reactive(new Status())

const isModalOpen = computed(() => modalStore.modals[Modal.BridgeConfirm])

const usdPrice = computed(() => {
  if (
    balanceWithToken.value?.token &&
    tokenStore.tokenUsdPrice(balanceWithToken.value.token.coinGeckoId)
  ) {
    return (
      tokenStore.tokenUsdPrice(balanceWithToken.value.token.coinGeckoId) || 0
    )
  }

  return 0
})

const balanceWithTokenAndPrice = computed(() => {
  if (!balanceWithToken.value) {
    return
  }

  return { ...balanceWithToken.value, usdPrice: usdPrice.value } as
    | BalanceWithTokenAndPrice
    | undefined
})

const amount = computed(
  () => new BigNumberInBase(formValues.value[BridgeField.Amount] || 0)
)

const { valueToString: amountToString } = useBigNumberFormatter(amount, {
  decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
})

const amountInUsd = computed(() =>
  amount.value.multipliedBy(new BigNumberInBase(usdPrice.value))
)

const { valueToString: amountInUsdToString } = useBigNumberFormatter(
  amountInUsd,
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const ethBridgeFee = computed(() => {
  if (!balanceWithTokenAndPrice.value) {
    return ZERO_IN_BASE
  }

  if (!usdPrice.value) {
    return ZERO_IN_BASE
  }

  if (usdPrice.value === 0) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(ETH_BRIDGE_FEE_IN_USD).dividedBy(usdPrice.value)
})

const ethBridgeFeeToString = computed(() =>
  ethBridgeFee.value.isZero()
    ? `< ${UI_MINIMAL_AMOUNT.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)}`
    : ethBridgeFee.value.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
)

const ethBridgeFeeInUsd = computed(() =>
  usdPrice.value
    ? ethBridgeFee.value.multipliedBy(new BigNumberInBase(usdPrice.value))
    : ZERO_IN_BASE
)

const ethBridgeFeeInUsdToString = computed(() =>
  ethBridgeFeeInUsd.value.isZero()
    ? `< ${UI_MINIMAL_AMOUNT.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)}`
    : ethBridgeFeeInUsd.value.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
)

const ibcBridgeFee = computed(() => {
  if (!balanceWithToken.value) {
    return ZERO_IN_BASE
  }

  if (!usdPrice.value || usdPrice.value === 0) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(IBC_BRIDGE_FEE_IN_USD).dividedBy(usdPrice.value)
})

const ibcBridgeFeeInUsd = computed(() => {
  return ibcBridgeFee.value.multipliedBy(new BigNumberInBase(usdPrice.value))
})

const ibcBridgeFeeInUsdToString = computed(() => {
  return ibcBridgeFeeInUsd.value.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
})

const transferAmount = computed(() => {
  if (isEthereumDestination.value) {
    return amount.value.minus(ethBridgeFee.value)
  }

  return amount.value
})

const { valueToString: transferAmountToString } = useBigNumberFormatter(
  transferAmount,
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const isConfirmationDisabled = computed(() => {
  return transferAmount.value.lte(0)
})

const transferAmountInUsd = computed(() =>
  transferAmount.value.multipliedBy(new BigNumberInBase(usdPrice.value))
)

const { valueToString: transferAmountInUsdToString } =
  useBigNumberFormatter(transferAmountInUsd)

const handlerFunction = computed(() => {
  if (isEthereumOrigin.value) {
    return depositFromEthereum
  }

  if (isCosmosNetworkOrigin.value) {
    return cosmosIbcTransferToInjective
  }

  if (isTransfer.value) {
    return transfer
  }

  if (isCosmosNetworkDestination.value) {
    return cosmosIbcTransferFromInjective
  }

  return withdrawToEthereum
})

function closeModal() {
  modalStore.closeModal(Modal.BridgeConfirm)
}

function confirm() {
  handlerFunction.value()
}

function transfer() {
  status.setLoading()

  if (!balanceWithToken.value) {
    return
  }

  accountStore
    .transfer({
      amount: new BigNumberInBase(formValues.value[BridgeField.Amount]),
      denom: formValues.value[BridgeField.Denom],
      destination: formValues.value[BridgeField.Destination],
      memo: formValues.value[BridgeField.Memo],
      token: balanceWithToken.value.token
    })
    .then(() => {
      success({ title: t('bridge.withdrawToInjectiveAddressSuccess') })

      emit('form:submit')
      emitFundingRefresh()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function withdrawToEthereum() {
  if (ethBridgeFee.value.gte(formValues.value[BridgeField.Amount])) {
    return
  }

  if (!balanceWithToken.value) {
    return
  }

  status.setLoading()

  peggyStore
    .withdraw({
      bridgeFee: ethBridgeFee.value,
      token: balanceWithToken.value.token,
      amount: new BigNumberInBase(formValues.value[BridgeField.Amount])
    })
    .then(() => {
      success({ title: t('bridge.withdrawFromInjectiveSuccess') })

      emit('form:submit')
      emitFundingRefresh()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function depositFromEthereum() {
  if (!balanceWithToken.value) {
    return
  }

  status.setLoading()

  peggyStore
    .transfer({
      amount: new BigNumberInBase(formValues.value[BridgeField.Amount]),
      balanceWithTokenAndPrice:
        balanceWithTokenAndPrice.value as BalanceWithTokenWithErc20BalanceWithPrice,
      token: balanceWithToken.value.token
    })
    .then(() => {
      success({ title: t('bridge.depositToInjectiveSuccess') })

      emit('form:submit')
      emitFundingRefresh()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function cosmosIbcTransferToInjective() {
  if (!balanceWithToken.value) {
    return
  }

  status.setLoading()

  ibcStore
    .deposit({
      destinationAddress: walletStore.injectiveAddress,
      token: balanceWithToken.value.token,
      amount: new BigNumberInBase(formValues.value[BridgeField.Amount])
    })
    .then(() => {
      success({ title: t('bridge.depositToInjectiveSuccess') })

      emit('form:submit')
      emitFundingRefresh()
    })
    .catch((error: any) => {
      $onError(error)
    })
    .finally(() => {
      status.setIdle()
    })
}

function cosmosIbcTransferFromInjective() {
  if (!balanceWithToken.value) {
    return
  }

  status.setLoading()

  ibcStore
    .withdraw({
      destinationAddress: formValues.value[BridgeField.Destination],
      token: balanceWithToken.value.token,
      amount: new BigNumberInBase(formValues.value[BridgeField.Amount])
    })
    .then(() => {
      success({ title: t('bridge.withdrawFromInjectiveSuccess') })

      emit('form:submit')
      emitFundingRefresh()
    })
    .catch((error: any) => {
      $onError(error)
    })
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <AppModal
    :is-open="isModalOpen"
    is-sm
    data-cy="transfer-confirm-modal"
    @modal:closed="closeModal"
  >
    <template #title>
      <h3>
        <span v-if="isDeposit">
          {{ $t('bridge.depositToInjective') }}
        </span>
        <span v-if="isWithdraw">
          {{ $t('bridge.withdrawFromInjective') }}
        </span>
        <span v-if="isTransfer">
          {{ $t('bridge.transferOnChain') }}
        </span>
      </h3>
    </template>

    <div class="pt-4">
      <h3
        class="text-xs font-semibold uppercase tracking-wider text-center text-gray-300"
      >
        {{ $t('bridge.confirmTransaction') }}
      </h3>

      <div v-if="balanceWithToken" class="text-center my-8">
        <CommonTokenIcon
          v-if="balanceWithToken.token.logo"
          :token="balanceWithToken.token"
          is-xl
          class="mx-auto"
        />
        <BaseIcon
          v-else
          name="category-alt"
          class="text-gray-200 rounded-full w-10 h-10 mx-auto"
        />
        <p
          class="text-gray-200 text-2xl font-bold tracking-0.4 mt-4"
          data-cy="transfer-confirm-modal-value-text-content"
        >
          {{ amountToString }}
          {{ balanceWithToken.token.symbol }}
        </p>
        <p
          v-if="amountInUsd.gt(0)"
          class="text-gray-500 text-sm tracking-0.4 mt-2"
          data-cy="transfer-confirm-modal-value-usd-text-content"
        >
          ${{ amountInUsdToString }}
        </p>
      </div>

      <div
        v-if="originNetworkMeta && destinationNetworkMeta"
        class="flex justify-between items-center mt-6"
      >
        <PartialsBridgeFormNetworkCard
          class="w-1/2"
          data-cy="transfer-confirm-modal-from-text-content"
          :is-hide-icon="
            originNetworkMeta.value === destinationNetworkMeta.value
          "
          :network-meta="originNetworkMeta"
        />

        <div
          class="bg-blue-500 min-w-6 h-6 mx-6 flex items-center justify-center rounded-full"
        >
          <BaseIcon name="arrow" class="text-gray-1000 w-4 h-4 rotate-180" />
        </div>

        <PartialsBridgeFormNetworkCard
          class="w-1/2"
          data-cy="transfer-confirm-modal-to-text-content"
          :is-hide-icon="
            originNetworkMeta.value === destinationNetworkMeta.value
          "
          :network-meta="destinationNetworkMeta"
        />
      </div>

      <div v-if="isInjectiveOrigin" class="mt-6">
        <!-- Amount -->
        <ModalsBridgeConfirmRow class="mb-4">
          <template #title>
            {{ $t('bridge.amount') }}
          </template>

          <template #amount>
            <span data-cy="transfer-confirm-modal-amount-text-content">
              {{ amountToString }}
              {{ balanceWithToken?.token.symbol }}
            </span>
          </template>

          <template #amountInUsd>
            <span data-cy="transfer-confirm-modal-amount-usd-text-content">
              ${{ amountInUsdToString }}
            </span>
          </template>
        </ModalsBridgeConfirmRow>

        <!-- Bridge Fee -->
        <ModalsBridgeConfirmRow
          v-if="isEthereumDestination || isCosmosNetworkDestination"
          class="mb-4"
        >
          <template #title>
            {{ $t('bridge.bridgeFee') }}
          </template>

          <template #amount>
            <span v-if="isCosmosNetworkDestination">
              {{ $t('bridge.waived') }}
            </span>
            <span
              v-else
              data-cy="transfer-confirm-modal-bridge-fee-text-content"
            >
              {{ ethBridgeFeeToString }}
              {{ balanceWithToken?.token.symbol }}
            </span>
          </template>

          <template #amountInUsd>
            <span data-cy="transfer-confirm-modal-bridge-fee-usd-text-content">
              ${{
                isEthereumDestination
                  ? ethBridgeFeeInUsdToString
                  : ibcBridgeFeeInUsdToString
              }}
            </span>
          </template>
        </ModalsBridgeConfirmRow>
      </div>

      <div v-if="isInjectiveOrigin">
        <ModalsBridgeConfirmRow class="mb-4" bold>
          <template #title>
            {{ $t('bridge.transferAmount') }}
          </template>

          <template #amount>
            <span data-cy="transfer-confirm-modal-transfer-amount-text-content">
              {{ transferAmountToString }}
              {{ balanceWithToken?.token.symbol }}
            </span>
          </template>

          <template #amountInUsd>
            <span
              data-cy="transfer-confirm-modal-transfer-amount-usd-text-content"
            >
              ${{ transferAmountInUsdToString }}
            </span>
          </template>
        </ModalsBridgeConfirmRow>

        <ModalsBridgeConfirmRow bold class="mb-6">
          <template #title>
            {{ $t('bridge.gasFee') }}
          </template>

          <template #amount>
            <span data-cy="transfer-confirm-modal-gas-fee-text-content">
              {{ $t('common.waived') }}
            </span>
          </template>
        </ModalsBridgeConfirmRow>
      </div>

      <div class="text-center mt-6">
        <AppButton
          is-lg
          class="w-full font-semibold rounded bg-blue-500 text-blue-900"
          :is-disabled="isConfirmationDisabled"
          :is-loading="status.isLoading()"
          data-cy="transfer-confirm-modal-confirm-button"
          @click="confirm"
        >
          <span v-if="transferAmount.lte(0)">
            {{ $t('bridge.insufficientAmount') }}
          </span>
          <span v-else>
            {{ $t('bridge.confirm') }}
          </span>
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>

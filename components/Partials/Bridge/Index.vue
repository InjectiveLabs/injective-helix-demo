<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { tokenSelectorDisabledNetworks } from '@injectivelabs/sdk-ui-ts'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { BridgeField, BridgeType, BridgeForm } from '@/types'

const ibcStore = useIbcStore()
const peggyStore = usePeggyStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()

const formValues = useFormValues<BridgeForm>() as Ref<BridgeForm>
const setFormValues = useSetFormValues()

const refreshBalanceStatus = reactive(new Status(StatusType.Idle))
const fetchBalanceStatus = reactive(new Status(StatusType.Idle))

const {
  isDeposit,
  isTransfer,
  isEthereumOrigin,
  isNetworkSupported,
  isEthereumDestination,
  isCosmosNetworkOrigin,
  isCosmosNetworkDestination
} = useBridgeState(formValues)
const { balanceWithToken, supplyWithBalance } = useBridgeBalance(formValues)

defineProps({
  isConnecting: Boolean
})

const isSelectorDisabled = computed(() =>
  tokenSelectorDisabledNetworks.includes(
    formValues.value[BridgeField.BridgingNetwork]
  )
)

const shouldConnectMetamask = computed(
  () =>
    walletStore.isCosmosWallet &&
    (isEthereumOrigin.value || isEthereumDestination.value)
)

const shouldConnectCosmosWallet = computed(
  () =>
    !walletStore.isCosmosWallet &&
    (isCosmosNetworkOrigin.value || isCosmosNetworkDestination.value)
)

const maxDecimals = computed(() => {
  if (!balanceWithToken.value) {
    return UI_DEFAULT_DISPLAY_DECIMALS
  }

  const defaultDecimalsLessThanTokenDecimals =
    UI_DEFAULT_DISPLAY_DECIMALS < balanceWithToken.value.token.decimals

  if (defaultDecimalsLessThanTokenDecimals) {
    return UI_DEFAULT_DISPLAY_DECIMALS
  }

  return balanceWithToken.value.token.decimals
})

const walletAddress = computed(() => {
  if (isTransfer.value) {
    return ''
  }

  if (isEthereumDestination.value) {
    return walletStore.address
  }

  return ibcStore.cosmosAddress
})

const { value: denom } = useStringField({
  name: BridgeField.Denom,
  initialValue: formValues.value[BridgeField.Denom]
})

useStringField({
  name: BridgeField.Destination,
  rule: '',
  dynamicRule: computed(() => {
    if (isDeposit.value) {
      return ''
    }

    if (isTransfer.value) {
      return 'required|injAddress'
    }

    if (!walletAddress.value) {
      return ''
    }

    return `required|addressByNetwork:${
      formValues.value[BridgeField.BridgingNetwork]
    }`
  })
})

function onAmountChange({ amount }: { amount: string }) {
  setFormValues({
    [BridgeField.Amount]: amount
  })
}

function onTokenChange() {
  nextTick(() => {
    if (balanceWithToken.value) {
      setFormValues(
        {
          [BridgeField.Amount]: ''
        },
        false
      )
    }
  })
}

function onSelectTokenClick() {
  fetchBalanceStatus.setLoading()

  balanceRefresh().finally(() => {
    fetchBalanceStatus.setIdle()
  })
}

function balanceRefresh() {
  return accountStore.fetchAccountPortfolio().then(() => {
    if (isEthereumOrigin.value) {
      return peggyStore.updateErc20BalancesWithTokenAndPrice()
    }

    if (isCosmosNetworkOrigin.value) {
      return ibcStore.fetchBalances()
    }
  })
}

function refreshBalance() {
  refreshBalanceStatus.setLoading()

  balanceRefresh().finally(() => {
    refreshBalanceStatus.setIdle()
  })
}
</script>

<template>
  <div>
    <div class="mt-6">
      <AppSelectToken
        v-if="isNetworkSupported"
        v-model:denom="denom"
        v-bind="{
          maxDecimals,
          isRequired: true,
          isDisabled: isConnecting,
          options: supplyWithBalance,
          amountFieldName: BridgeField.Amount,
          isLoading: fetchBalanceStatus.isLoading(),
          isTokenSelectorDisabled: isSelectorDisabled
        }"
        @update:denom="onTokenChange"
        @update:max="onAmountChange"
        @update:modal="onSelectTokenClick"
      >
        <template #default>
          <span> {{ $t('bridge.amount') }} </span>
        </template>

        <template #token-item="{ openTokenSelectorModal, selectedToken }">
          <div
            class="flex items-center gap-2 p-1.5"
            :class="{
              'hover:bg-gray-150 cursor-pointer rounded-xl  transition-all duration-300 ease-in-out':
                supplyWithBalance.length > 1
            }"
            @click="openTokenSelectorModal"
          >
            <span v-if="isConnecting">&mdash;</span>

            <AppSelectTokenItem
              v-else-if="selectedToken"
              :class="{
                'cursor-default':
                  isConnecting ||
                  supplyWithBalance.length === 1 ||
                  isSelectorDisabled
              }"
              v-bind="{
                token: selectedToken.token
              }"
            />

            <div
              v-else-if="supplyWithBalance.length > 0"
              class="whitespace-nowrap"
            >
              {{ $t('trade.swap.tokenSelector.selectToken') }}
            </div>

            <BaseIcon
              v-if="
                !isConnecting &&
                !isSelectorDisabled &&
                (supplyWithBalance.length > 1 || !selectedToken)
              "
              name="caret-down-slim"
              is-sm
            />
          </div>
        </template>

        <template
          #balance="{
            changeMax,
            selectedToken,
            valueToBigNumber,
            maxBalanceToString
          }"
        >
          <AppSpinner
            v-if="isConnecting || refreshBalanceStatus.isLoading()"
            is-sm
          />
          <div
            v-else-if="selectedToken"
            class="text-right flex items-center gap-2"
          >
            <BaseIcon
              name="rotate"
              class="h-4 w-4 cursor-pointer text-blue-500"
              @click="refreshBalance"
            />
            <p class="text-xs text-blue-500">
              <span>
                {{ $t('trade.balance', { balance: maxBalanceToString }) }}
              </span>
            </p>
            <span
              v-if="valueToBigNumber.gt(0)"
              class="cursor-pointer text-blue-500 hover:text-opacity-80 bg-blue-550 bg-opacity-20 px-1 py-[1.5px] rounded uppercase text-[10px]"
              @click="changeMax"
            >
              {{ $t('trade.max') }}
            </span>
          </div>
        </template>
      </AppSelectToken>

      <PartialsBridgeNotSupported
        v-else-if="!isNetworkSupported"
        v-bind="{
          selectedNetwork: formValues[BridgeField.BridgingNetwork]
        }"
      />
    </div>

    <div v-if="isNetworkSupported" class="mt-6">
      <AppButton
        v-if="shouldConnectMetamask || shouldConnectCosmosWallet"
        is-lg
        class="w-full font-semibold rounded bg-blue-500 text-blue-900"
        data-cy="transfer-modal-transfer-now-button"
        :is-disabled="true"
        @click="() => {}"
      >
        {{
          $t(
            `bridge.${
              shouldConnectMetamask
                ? 'keplrConnectedForEthereum'
                : 'metamaskConnectedForCosmos'
            }`
          )
        }}
      </AppButton>

      <template v-else>
        <PartialsBridgeDeposit
          v-if="formValues[BridgeField.BridgeType] === BridgeType.Deposit"
        >
          <PartialsBridgeFormButton />
        </PartialsBridgeDeposit>
        <PartialsBridgeWithdraw
          v-if="formValues[BridgeField.BridgeType] === BridgeType.Withdraw"
        >
          <template #default>
            <PartialsBridgeFormButton />
          </template>

          <template #destination-address>
            <PartialsBridgeDestinationAddress v-bind="{ walletAddress }" />
          </template>
        </PartialsBridgeWithdraw>
        <PartialsBridgeTransfer
          v-if="formValues[BridgeField.BridgeType] === BridgeType.Transfer"
          v-bind="$attrs"
        >
          <template #default>
            <PartialsBridgeFormButton />
          </template>

          <template #destination-address>
            <PartialsBridgeDestinationAddress v-bind="{ walletAddress }" />
          </template>
        </PartialsBridgeTransfer>
      </template>
    </div>
  </div>
</template>

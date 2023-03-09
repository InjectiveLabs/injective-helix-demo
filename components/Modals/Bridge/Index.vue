<script setup lang="ts">
import { Token } from '@injectivelabs/token-metadata'
import {
  Status,
  StatusType,
  BigNumberInBase,
  BigNumberInWei,
  INJ_DENOM
} from '@injectivelabs/utils'
import {
  BalanceWithToken,
  BalanceWithTokenWithErc20Balance,
  BalanceWithTokenWithErc20BalanceWithPrice
} from '@injectivelabs/sdk-ui-ts'
import {
  BINANCE_DEPOSIT_ADDRESSES,
  INJ_GAS_BUFFER_FOR_BRIDGE,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import {
  Modal,
  BridgeForm,
  BridgeType,
  BridgeField,
  TransferDirection
} from '@/types'

const modalStore = useModalStore()
const peggyStore = usePeggyStore()
const walletStore = useWalletStore()
const { $onError } = useNuxtApp()

const resetForm = useResetForm()
const formErrors = useFormErrors()
const formValues = useFormValues<BridgeForm>()

const emit = defineEmits<{
  (e: 'bridge:init'): void
  (e: 'form:reset', state?: Token): void
}>()

const {
  isDeposit,
  isWithdraw,
  originIsEthereum,
  networkIsNotSupported,
  destinationIsInjective
} = useBridgeState({
  formValues
})

const { transferableBalancesWithToken } = useBridgeBalance({
  formValues
})

const memoRequired = ref(false)
const status = reactive(new Status(StatusType.Loading))

const isModalOpen = computed(() => modalStore.modals[Modal.Bridge])
const hasFormErrors = computed(() => Object.keys(formErrors.value).length > 0)

const shouldConnectMetamask = computed(
  () => walletStore.isCosmosWallet && isDeposit.value && originIsEthereum.value
)

const maxDecimals = computed(() => {
  const defaultDecimalsLessThanTokenDecimals =
    UI_DEFAULT_DISPLAY_DECIMALS < formValues.value[BridgeField.Token].decimals

  if (defaultDecimalsLessThanTokenDecimals) {
    return UI_DEFAULT_DISPLAY_DECIMALS
  }

  return formValues.value[BridgeField.Token].decimals
})

const balanceWithToken = computed(() => {
  const balanceWithToken = transferableBalancesWithToken.value.find(
    (b) => b.token.denom === denom.value
  )

  if (!balanceWithToken) {
    return
  }

  if (balanceWithToken.denom !== INJ_DENOM) {
    return balanceWithToken
  }

  const noGasBufferNeededForTransfer =
    walletStore.isWalletExemptFromGasFee ||
    formValues.value[BridgeField.TransferDirection] ===
      TransferDirection.tradingAccountToBank

  if (noGasBufferNeededForTransfer) {
    return balanceWithToken
  }

  const transferableBalance = new BigNumberInWei(balanceWithToken.balance)
    .toBase()
    .minus(INJ_GAS_BUFFER_FOR_BRIDGE)
  const transferableBalanceCapped = new BigNumberInWei(
    transferableBalance.gt(0) ? transferableBalance : 0
  )

  return {
    ...balanceWithToken,
    balance: transferableBalanceCapped.toFixed()
  } as BalanceWithToken
})

const needsAllowanceSet = computed(() => {
  const balanceWithTokenAndAllowance =
    peggyStore.tradeableErc20BalancesWithTokenAndPrice.find(
      (token) => token.denom === denom.value
    ) as BalanceWithTokenWithErc20BalanceWithPrice

  const allowance = new BigNumberInBase(
    balanceWithTokenAndAllowance?.erc20Balance?.allowance || 0
  )

  return isDeposit.value && originIsEthereum.value && allowance.lte(0)
})

const { value: denom } = useStringField({
  name: BridgeField.Denom,
  initialValue: formValues.value[BridgeField.Denom]
})

const { value: destination, errors: destinationErrors } = useStringField({
  name: BridgeField.Destination,
  rule: '',
  dynamicRule: computed(() =>
    isWithdraw.value && destinationIsInjective.value
      ? 'required|injAddress'
      : ''
  )
})

const { value: memo, resetField: resetMemo } = useStringField({
  name: BridgeField.Memo,
  rule: '',
  dynamicRule: computed(() => {
    return memoRequired.value ? 'required' : ''
  })
})

function handleAmountChange({ amount }: { amount: string }) {
  formValues.value[BridgeField.Amount] = amount
}

function handleTokenChange() {
  nextTick(() => {
    if (balanceWithToken.value) {
      formValues.value[BridgeField.Amount] = ''
      formValues.value[BridgeField.Token] = balanceWithToken.value.token
    }
  })
}

function handleBridgeInit() {
  emit('bridge:init')
}

function handleModalClose() {
  resetForm()

  modalStore.closeModal(Modal.Bridge)
}

watch(isModalOpen, (modalShown: boolean) => {
  if (modalShown) {
    status.setLoading()

    Promise.all([peggyStore.fetchErc20BalancesWithTokenAndPrice()])
      .catch($onError)
      .finally(() => status.setIdle())
  }
})

watch(destination, (value: string) => {
  if (BINANCE_DEPOSIT_ADDRESSES.includes(value)) {
    memoRequired.value = true
  } else {
    formValues.value[BridgeField.Memo] = ''
    memoRequired.value = false
  }
})
</script>

<template>
  <AppModal
    sm
    :show="isModalOpen"
    :ignore="['.v-popper__popper']"
    :show-loading="status.isLoading()"
    :modal-closed:animation="resetForm"
    @modal:closed="handleModalClose"
  >
    <template #title>
      <h3 class="flex items-center">
        <span v-if="formValues[BridgeField.BridgeType] === BridgeType.Deposit">
          {{ $t('bridge.depositToInjective') }}
        </span>
        <span
          v-else-if="formValues[BridgeField.BridgeType] === BridgeType.Withdraw"
        >
          {{ $t('bridge.withdrawFromInjective') }}
        </span>
        <span v-else>
          {{ $t('bridge.transferFromToTradingAccount') }}
        </span>

        <CommonInfoTooltip
          v-if="formValues[BridgeField.BridgeType] === BridgeType.Transfer"
          class="ml-2"
          :tooltip="$t('bridge.transferTitleTooltip')"
        />
      </h3>
    </template>

    <div v-if="walletStore.isUserWalletConnected">
      <div class="mb-4">
        <ModalsBridgeTransferDirectionSwitch
          v-if="formValues[BridgeField.BridgeType] === BridgeType.Transfer"
        />

        <ModalsBridgeNetworkSelect v-else>
          <template #title>
            <span
              v-if="formValues[BridgeField.BridgeType] === BridgeType.Deposit"
            >
              {{ $t('bridge.selectOriginNetwork') }}
            </span>
            <span v-else>
              {{ $t('bridge.selectDestinationNetwork') }}
            </span>
          </template>
        </ModalsBridgeNetworkSelect>
      </div>

      <div v-if="isWithdraw && destinationIsInjective">
        <div class="mt-6">
          <AppInput
            v-model="destination"
            clear-on-paste
            :label="$t('bridge.injAddress')"
            placeholder="inj"
            wrapper-classes="py-2 px-1"
            data-cy="transfer-modal-inj-address-input"
          />

          <p
            v-if="destinationErrors.length > 0"
            class="text-red-500 text-xs mt-1"
          >
            {{ destinationErrors[0] }}
          </p>
        </div>
        <div class="my-4 w-full">
          <div class="flex items-center justify-between text-gray-200">
            <CommonInfoTooltip :tooltip="$t('memo.memoTooltip')">
              <span class="text-xs flex items-center">
                {{ $t('memo.memo') }}
                <BaseIcon
                  name="circle-info"
                  class="text-gray-500 w-3 h-3 ml-2"
                />
              </span>
            </CommonInfoTooltip>

            <AppCheckbox v-model="memoRequired" @input="resetMemo">
              {{ $t('common.required') }}
            </AppCheckbox>
          </div>
          <div v-if="memoRequired" class="mt-2">
            <AppInput
              v-model="memo"
              wrapper-classes="py-2 px-1"
              :placeholder="$t('memo.memoPlaceholder')"
            />
          </div>
        </div>
      </div>

      <ModalsBridgeNotSupportedBridgeTypeNote
        v-if="networkIsNotSupported"
        v-bind="{
          selectedNetwork: formValues[BridgeField.BridgingNetwork]
        }"
      />

      <div v-else>
        <div>
          <AppSelectToken
            v-model:denom="denom"
            v-bind="{
              maxDecimals,
              required: true,
              inputDisabled: needsAllowanceSet,
              amountFieldName: BridgeField.Amount,
              options: transferableBalancesWithToken
            }"
            @update:denom="handleTokenChange"
            @update:max="handleAmountChange"
          >
            <span> {{ $t('bridge.amount') }} </span>
          </AppSelectToken>
        </div>
        <div class="mt-6 text-center">
          <AppButton
            v-if="shouldConnectMetamask"
            lg
            class="w-full font-semibold rounded bg-blue-500 text-blue-900"
            data-cy="transfer-modal-transfer-now-button"
            :disabled="true"
            @click="() => {}"
          >
            {{ $t('bridge.keplrConnectedForEthereum') }}
          </AppButton>

          <template v-else>
            <CommonAllowance
              v-if="needsAllowanceSet && balanceWithToken"
              v-bind="{
                balanceWithToken: balanceWithToken as BalanceWithTokenWithErc20Balance
              }"
            />

            <AppButton
              v-else
              lg
              :disabled="hasFormErrors || formValues[BridgeField.Amount] === ''"
              class="w-full font-semibold rounded bg-blue-500 text-blue-900"
              data-cy="transfer-modal-transfer-now-button"
              @click="handleBridgeInit"
            >
              <span
                v-if="formValues[BridgeField.BridgeType] === BridgeType.Deposit"
              >
                {{ $t('bridge.depositNow') }}
              </span>
              <span
                v-else-if="
                  formValues[BridgeField.BridgeType] === BridgeType.Withdraw
                "
              >
                {{ $t('bridge.withdrawNow') }}
              </span>
              <span v-else>
                {{ $t('bridge.transferNow') }}
              </span>
            </AppButton>
          </template>
        </div>
      </div>
    </div>
    <CommonUserNotConnectedNote v-else />
  </AppModal>
</template>

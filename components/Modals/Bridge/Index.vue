<script setup lang="ts">
import {
  BigNumberInBase,
  BigNumberInWei,
  INJ_DENOM
} from '@injectivelabs/utils'
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
const tokenStore = useTokenStore()
const walletStore = useWalletStore()
const {
  errors,
  setFieldValue,
  resetForm: resetFormValidation
} = useForm<BridgeForm>()

const emit = defineEmits<{
  (e: 'bridge:init'): void
}>()

const {
  form,
  isDeposit,
  resetForm,
  bridgeType,
  isWithdraw,
  originIsEthereum,
  networkIsNotSupported,
  destinationIsInjective
} = useBridgeState()

const { transferableBalancesWithToken } = useBridgeBalance()

const isModalOpen = computed(() => modalStore.modals[Modal.Bridge])

const hasFormErrors = computed(() => Object.keys(errors.value).length > 0)

const isConfirmDisabled = computed(() => {
  return hasFormErrors.value || form[BridgeField.Amount] === ''
})

const shouldConnectMetamask = computed(() => {
  return walletStore.isCosmosWallet && isDeposit.value && originIsEthereum.value
})

const maxDecimals = computed(() => {
  const defaultDecimalsLessThanTokenDecimals =
    UI_DEFAULT_DISPLAY_DECIMALS < form[BridgeField.Token].decimals

  if (defaultDecimalsLessThanTokenDecimals) {
    return UI_DEFAULT_DISPLAY_DECIMALS
  }

  return form[BridgeField.Token].decimals
})

const tokenWithBalance = computed(() => {
  const tokenWithBalance = transferableBalancesWithToken.value.find(
    (b) => b.token.denom === denom.value
  )

  if (!tokenWithBalance) {
    return
  }

  if (tokenWithBalance.denom !== INJ_DENOM) {
    return tokenWithBalance
  }

  const noGasBufferNeededForTransfer =
    walletStore.isWalletExemptFromGasFee ||
    form[BridgeField.TransferDirection] ===
      TransferDirection.tradingAccountToBank

  if (noGasBufferNeededForTransfer) {
    return tokenWithBalance
  }

  const transferableBalance = new BigNumberInWei(tokenWithBalance.balance)
    .toBase()
    .minus(INJ_GAS_BUFFER_FOR_BRIDGE)
  const transferableBalanceCapped = new BigNumberInWei(
    transferableBalance.gt(0) ? transferableBalance : 0
  )
  const transferableBalanceCappedToBase = transferableBalanceCapped.toBase()

  return {
    ...tokenWithBalance,
    balance: transferableBalanceCapped.toFixed(),
    balanceToBase: transferableBalanceCappedToBase.toFixed()
  }
})

const needsAllowanceSet = computed(() => {
  const tokenWithBalanceAndAllowance =
    tokenStore.tradeableErc20TokensWithBalanceAndPrice.find(
      (token) => token.denom === denom.value
    )

  const allowance = new BigNumberInBase(
    tokenWithBalanceAndAllowance?.allowance || 0
  )

  return isDeposit.value && originIsEthereum.value && allowance.lte(0)
})

const { value: denom } = useStringField({
  name: BridgeField.Denom,
  initialValue: form[BridgeField.Denom]
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

const memoRequired = computed(() => {
  return (
    !!destination.value && BINANCE_DEPOSIT_ADDRESSES.includes(destination.value)
  )
})

const { value: memo, resetField: resetMemo } = useStringField({
  name: BridgeField.Memo,
  rule: '',
  dynamicRule: computed(() => (memoRequired.value ? 'required' : ''))
})

const memoValue = computed({
  get: (): string => memo.value,
  set: (memo: string) => {
    form[BridgeField.Memo] = memo

    setFieldValue(BridgeField.Memo, memo)
  }
})

const denomValue = computed({
  get: (): string => denom.value,
  set: (denom: string) => {
    form[BridgeField.Denom] = denom

    setFieldValue(BridgeField.Denom, denom)
  }
})

const destinationValue = computed({
  get: (): string => destination.value,
  set: (destination: string) => {
    form[BridgeField.Destination] = destination

    setFieldValue(BridgeField.Destination, destination)
  }
})

function handleAmountChange({ amount }: { amount: string }) {
  form[BridgeField.Amount] = amount

  setFieldValue(BridgeField.Amount, amount)
}

function handleTokenChange() {
  nextTick(() => {
    if (tokenWithBalance.value) {
      form[BridgeField.Amount] = ''
      form[BridgeField.Token] = tokenWithBalance.value.token

      setFieldValue(BridgeField.Denom, tokenWithBalance.value.denom)
      setFieldValue(BridgeField.Amount, '')
    }
  })
}

function handleBridgeInit() {
  emit('bridge:init')
}

function handleResetBridge() {
  resetFormValidation()
  resetForm()
}

function handleModalClose() {
  handleResetBridge()

  modalStore.closeModal(Modal.Bridge)
}
</script>

<template>
  <AppModal
    :show="isModalOpen"
    :ignore="['.v-popper__popper']"
    sm
    :modal-closed:animation="handleResetBridge"
    @modal:closed="handleModalClose"
  >
    <template #title>
      <h3 class="flex items-center">
        <span v-if="bridgeType === BridgeType.Deposit">
          {{ $t('bridge.depositToInjective') }}
        </span>
        <span v-else-if="bridgeType === BridgeType.Withdraw">
          {{ $t('bridge.withdrawFromInjective') }}
        </span>
        <span v-else>
          {{ $t('bridge.transferFromToTradingAccount') }}
        </span>

        <CommonInfoTooltip
          v-if="bridgeType === BridgeType.Transfer"
          class="ml-2"
          :tooltip="$t('bridge.transferTitleTooltip')"
        />
      </h3>
    </template>

    <div v-if="walletStore.isUserWalletConnected">
      <div class="mb-4">
        <ModalsBridgeTransferDirectionSwitch
          v-if="bridgeType === BridgeType.Transfer"
        />

        <ModalsBridgeNetworkSelect v-else>
          <template #title>
            <span v-if="bridgeType === BridgeType.Deposit">
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
            v-model="destinationValue"
            clear-on-paste
            placeholder="inj"
            wrapper-classes="py-2 px-1"
            :label="$t('bridge.injAddress')"
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
              v-model="memoValue"
              wrapper-classes="py-2 px-1"
              :placeholder="$t('memo.memoPlaceholder')"
            />
          </div>
        </div>
      </div>

      <ModalsBridgeNotSupportedBridgeTypeNote
        v-if="networkIsNotSupported"
        v-bind="{
          selectedNetwork: form[BridgeField.BridgingNetwork]
        }"
      />

      <div v-else>
        <div>
          <AppSelectToken
            v-model:denom="denomValue"
            v-bind="{
              maxDecimals,
              required: true,
              inputDisabled: needsAllowanceSet,
              amountFieldName: BridgeField.Amount,
              options: transferableBalancesWithToken
            }"
            @update:amount="handleAmountChange"
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
              v-if="needsAllowanceSet && tokenWithBalance"
              :token-with-balance="tokenWithBalance"
            />

            <AppButton
              v-else
              lg
              :disabled="isConfirmDisabled"
              class="w-full font-semibold rounded bg-blue-500 text-blue-900"
              data-cy="transfer-modal-transfer-now-button"
              @click="handleBridgeInit"
            >
              <span v-if="bridgeType === BridgeType.Deposit">
                {{ $t('bridge.depositNow') }}
              </span>
              <span v-else-if="bridgeType === BridgeType.Withdraw">
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

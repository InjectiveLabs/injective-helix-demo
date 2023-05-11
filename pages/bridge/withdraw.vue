<script setup lang="ts">
import {
  BigNumberInBase,
  BigNumberInWei,
  INJ_DENOM
} from '@injectivelabs/utils'
import {
  ZERO_IN_BASE,
  BalanceWithToken,
  BalanceWithTokenWithErc20Balance,
  BridgingNetwork
} from '@injectivelabs/sdk-ui-ts'
import {
  BINANCE_DEPOSIT_ADDRESSES,
  INJ_GAS_BUFFER_FOR_BRIDGE,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { Modal, BridgeForm, BridgeType, BridgeField } from '@/types'
import { isTokenWormholeToken } from '~/app/data/bridge'

const modalStore = useModalStore()
const peggyStore = usePeggyStore()
const walletStore = useWalletStore()

const formErrors = useFormErrors()
const formValues = useFormValues<BridgeForm>()

useStringField({
  name: BridgeField.BridgeType,
  initialValue: BridgeType.Withdraw
})

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

  const noGasBufferNeededForTransfer = walletStore.isWalletExemptFromGasFee

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

const allowance = computed(() => {
  if (!balanceWithToken.value) {
    return ZERO_IN_BASE
  }

  const balanceWithTokenWithErc20Balance =
    balanceWithToken.value as BalanceWithTokenWithErc20Balance

  return new BigNumberInWei(
    balanceWithTokenWithErc20Balance.erc20Balance?.allowance || 0
  ).toBase(balanceWithTokenWithErc20Balance.token.decimals)
})

const needsAllowanceSet = computed(
  () =>
    isDeposit.value &&
    originIsEthereum.value &&
    allowance.value.lt(formValues.value[BridgeField.Amount]) &&
    new BigNumberInBase(balanceWithToken.value?.balance || '').gt(0)
)

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

onMounted(() => {
  peggyStore.getErc20BalancesWithTokenAndPrice()
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

function handleBridgeConfirmation() {
  nextTick(() => {
    modalStore.openModal({ type: Modal.BridgeConfirm })

    if (isTokenWormholeToken(formValues.value[BridgeField.Token])) {
      formValues.value[BridgeField.BridgingNetwork] = BridgingNetwork.EthereumWh
    }
  })
}

function handleBridgeConfirmed() {
  modalStore.closeModal(Modal.BridgeConfirm)
}

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
  <div class="mb-4">
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
              <BaseIcon name="circle-info" class="text-gray-500 w-3 h-3 ml-2" />
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
      <div class="mt-6">
        <AppSelectToken
          v-model:denom="denom"
          v-bind="{
            maxDecimals,
            required: true,
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
                allowance,
                balanceWithToken: balanceWithToken as BalanceWithTokenWithErc20Balance
              }"
          />

          <AppButton
            v-else
            lg
            :disabled="hasFormErrors || formValues[BridgeField.Amount] === ''"
            class="w-full font-semibold rounded bg-blue-500 text-blue-900"
            data-cy="transfer-modal-transfer-now-button"
            @click="handleBridgeConfirmation"
          >
            <span>
              {{ $t('bridge.withdrawNow') }}
            </span>
          </AppButton>
        </template>
      </div>
    </div>
    <ModalsBridgeConfirm @form:submit="handleBridgeConfirmed" />
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { TokenWithBalance } from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  BINANCE_DEPOSIT_ADDRESSES,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import {
  BridgeForm,
  BridgeFormValue,
  BridgeField,
  BridgeType,
  Modal,
  TransferDirection
} from '@/types'
import { usdcTokenDenom } from '@/app/data/token'

const props = defineProps({
  hasFormErrors: Boolean,

  bridgeType: {
    required: true,
    type: String as PropType<BridgeType>
  },

  cachedTokens: {
    required: true,
    type: Array as PropType<Token[]>
  },

  formValues: {
    required: true,
    type: Object as PropType<BridgeForm>
  }
})

const emit = defineEmits<{
  (e: 'form:update', state: BridgeFormValue): void
  (e: 'form:submit'): void
  (e: 'form:reset', state?: Token): void
}>()

const modalStore = useModalStore()
const tokenStore = useTokenStore()
const walletStore = useWalletStore()

const { transferableBalancesWithToken } = useBridgeBalance({
  bridgeForm: computed(() => props.formValues),
  bridgeType: computed(() => props.bridgeType),
  cachedTokens: computed(() => props.cachedTokens)
})

const { destinationIsInjective, isWithdraw, networkIsNotSupported } =
  useBridgeNetwork({
    bridgeForm: computed(() => props.formValues),
    bridgeType: computed(() => props.bridgeType)
  })

const filteredBalances = computed(() =>
  transferableBalancesWithToken.value.filter(
    (balance) => ![usdcTokenDenom.USDCso].includes(balance.denom.toLowerCase())
  )
)

const maxDecimals = computed(() => {
  const defaultDecimalsLessThanTokenDecimals =
    UI_DEFAULT_DISPLAY_DECIMALS < props.formValues[BridgeField.Token].decimals

  if (defaultDecimalsLessThanTokenDecimals) {
    return UI_DEFAULT_DISPLAY_DECIMALS
  }

  return props.formValues[BridgeField.Token].decimals
})

const tokenWithBalance = computed(() => {
  return transferableBalancesWithToken.value.find(
    (b) => b.token.denom === denom.value
  )
})

const tokenWithAllowance = computed(() => {
  return tokenStore.erc20TokensWithBalanceAndPriceFromBank.find(
    (token) => token.denom === denom.value
  )
})

const tokenWithAllowanceAndBalance = computed(() => {
  if (!tokenWithBalance.value || !tokenWithAllowance.value) {
    return { ...props.formValues[BridgeField.Token] } as TokenWithBalance
  }

  return {
    ...props.formValues[BridgeField.Token],
    allowance: tokenWithAllowance.value.allowance,
    balance: tokenWithBalance.value.balance
  } as TokenWithBalance
})

const hasAllowance = computed(() => {
  if ([BridgeType.Transfer, BridgeType.Withdraw].includes(props.bridgeType)) {
    return true
  }

  if (!tokenWithAllowance.value) {
    return false
  }

  return new BigNumberInBase(tokenWithAllowance.value.allowance).gt(0)
})

const shouldConnectMetamask = computed(() => {
  return walletStore.isCosmosWallet && props.bridgeType === BridgeType.Deposit
})

const isConfirmDisabled = computed(() => {
  return props.hasFormErrors || props.formValues[BridgeField.Amount] === ''
})

const { value: denom } = useStringField({
  name: BridgeField.Denom
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

function handleMaxAmountChange(amount: string) {
  emit('form:update', { field: BridgeField.Amount, value: amount })
}

function handleTokenChange() {
  nextTick(() => {
    if (tokenWithBalance.value) {
      emit('form:update', {
        field: BridgeField.Amount,
        value: ''
      })

      emit('form:update', {
        field: BridgeField.Token,
        value: tokenWithBalance.value.token
      })
    }
  })
}

function handleCloseModal() {
  modalStore.closeModal(Modal.Bridge)
}

function handleConfirm() {
  emit('form:submit')
}

function handleResetBridge() {
  emit('form:reset')
}

function handleTransferDirectionSwitch() {
  const updatedTransferDirection =
    props.formValues[BridgeField.TransferDirection] ===
    TransferDirection.bankToTradingAccount
      ? TransferDirection.tradingAccountToBank
      : TransferDirection.bankToTradingAccount

  emit('form:update', {
    field: BridgeField.TransferDirection,
    value: updatedTransferDirection
  })
}

function handleBridgingNetworkChange(bridgingNetwork: string) {
  handleResetBridge()

  emit('form:update', {
    field: BridgeField.BridgingNetwork,
    value: bridgingNetwork
  })
}
</script>

<template>
  <AppModalWrapper
    :show="modalStore.modals[Modal.Bridge]"
    :ignore="['.v-popper__popper']"
    sm
    :modal-closed:animation="handleResetBridge"
    @modal:closed="handleCloseModal"
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

        <AppInfoTooltip
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
          v-bind="{
            transferDirection: formValues[BridgeField.TransferDirection]
          }"
          @transfer-direction:switch="handleTransferDirectionSwitch"
        />

        <ModalsBridgeNetworkSelect
          v-else
          v-bind="{
            value: formValues[BridgeField.BridgingNetwork],
            bridgeType
          }"
          @update:network="handleBridgingNetworkChange"
        >
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
            v-model="destination"
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
            <AppInfoTooltip :tooltip="$t('memo.memoTooltip')">
              <span class="text-xs">
                {{ $t('memo.memo') }}
              </span>
            </AppInfoTooltip>

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

      <div
        v-if="
          !networkIsNotSupported &&
          ![usdcTokenDenom.USDCet, usdcTokenDenom.USDCso].includes(
            formValues[BridgeField.Token].denom.toLowerCase()
          )
        "
      >
        <div v-if="hasAllowance">
          <AppSelectToken
            v-model:denom="denom"
            required
            :amount-field-name="BridgeField.Amount"
            :max-decimals="maxDecimals"
            :options="filteredBalances"
            @update:denom="handleTokenChange"
            @update:max="handleMaxAmountChange"
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
              v-if="!hasAllowance"
              :token-with-balance="tokenWithAllowanceAndBalance"
            />

            <AppButton
              v-else
              lg
              :disabled="isConfirmDisabled"
              class="w-full font-semibold rounded bg-blue-500 text-blue-900"
              data-cy="transfer-modal-transfer-now-button"
              @click="handleConfirm"
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

      <ModalsBridgeNotSupportedBridgeTypeNote
        v-else
        v-bind="{
          formValues,
          selectedNetwork: formValues[BridgeField.BridgingNetwork],
          bridgeType
        }"
      />
    </div>
    <CommonUserNotConnectedNote v-else />
  </AppModalWrapper>
</template>

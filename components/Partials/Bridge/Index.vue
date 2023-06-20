<script setup lang="ts">
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { BridgeField, BridgeType, BridgeForm } from '@/types'

const peggyStore = usePeggyStore()
const walletStore = useWalletStore()

const formValues = useFormValues<BridgeForm>() as Ref<BridgeForm>

const { originIsEthereum, networkIsSupported } = useBridgeState(formValues)
const { balanceWithToken, supplyWithBalance } = useBridgeBalance(formValues)

const shouldConnectMetamask = computed(
  () => walletStore.isCosmosWallet && originIsEthereum.value
)

const maxDecimals = computed(() => {
  const defaultDecimalsLessThanTokenDecimals =
    UI_DEFAULT_DISPLAY_DECIMALS < formValues.value[BridgeField.Token].decimals

  if (defaultDecimalsLessThanTokenDecimals) {
    return UI_DEFAULT_DISPLAY_DECIMALS
  }

  return formValues.value[BridgeField.Token].decimals
})

const { value: denom } = useStringField({
  name: BridgeField.Denom,
  initialValue: formValues.value[BridgeField.Denom]
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

function handleTokenSelectorOnClick(show: boolean) {
  if (show && originIsEthereum.value) {
    peggyStore.updateErc20BalancesWithTokenAndPrice()
  }
}
</script>

<template>
  <div>
    <div class="mt-6">
      <AppSelectToken
        v-if="networkIsSupported"
        v-model:denom="denom"
        v-bind="{
          maxDecimals,
          required: true,
          amountFieldName: BridgeField.Amount,
          options: supplyWithBalance
        }"
        @update:denom="handleTokenChange"
        @update:max="handleAmountChange"
        @update:show="handleTokenSelectorOnClick"
      >
        <span> {{ $t('bridge.amount') }} </span>
      </AppSelectToken>

      <PartialsBridgeNotSupported
        v-else
        v-bind="{
          selectedNetwork: formValues[BridgeField.BridgingNetwork]
        }"
      />
    </div>

    <div v-if="networkIsSupported" class="mt-6">
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
        <PartialsBridgeDeposit
          v-if="formValues[BridgeField.BridgeType] === BridgeType.Deposit"
        >
          <PartialsBridgeFormButton />
        </PartialsBridgeDeposit>
        <PartialsBridgeWithdraw
          v-if="formValues[BridgeField.BridgeType] === BridgeType.Withdraw"
        >
          <PartialsBridgeFormButton />
        </PartialsBridgeWithdraw>
        <PartialsBridgeTransfer
          v-if="formValues[BridgeField.BridgeType] === BridgeType.Transfer"
        >
          <PartialsBridgeFormButton />
        </PartialsBridgeTransfer>
      </template>
    </div>
  </div>
</template>

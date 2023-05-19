<script lang="ts" setup>
import { BigNumberInBase, Status } from '@injectivelabs/utils'
import { Modal, SubaccountTransferField, SubaccountTransferForm } from '@/types'
import { injToken } from '@/app/data/token'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'

const modalStore = useModalStore()
const accountStore = useAccountStore()
const walletStore = useWalletStore()
const { t } = useLang()
const { success } = useNotifications()
const { $onError } = useNuxtApp()

const { values: formValues, resetForm: resetSubaccountTransferForm } =
  useForm<SubaccountTransferForm>({
    initialValues: {
      [SubaccountTransferField.SrcSubaccountId]:
        walletStore.defaultSubaccountId,
      [SubaccountTransferField.DstSubaccountId]: '',
      [SubaccountTransferField.Token]: injToken,
      [SubaccountTransferField.Denom]: injToken.denom,
      [SubaccountTransferField.Amount]: ''
    },
    keepValuesOnUnmount: true
  })
const formErrors = useFormErrors()

const hasFormErrors = computed(
  () =>
    Object.keys(formErrors.value).length > 0 ||
    formValues[SubaccountTransferField.Amount] === ''
)

const status = reactive(new Status())

const { supplyWithBalance } = useSubaccountTransferBalance(
  computed(() => formValues)
)

const maxDecimals = computed(() => {
  const defaultDecimalsLessThanTokenDecimals =
    UI_DEFAULT_DISPLAY_DECIMALS <
    formValues[SubaccountTransferField.Token].decimals

  if (defaultDecimalsLessThanTokenDecimals) {
    return UI_DEFAULT_DISPLAY_DECIMALS
  }

  return formValues[SubaccountTransferField.Token].decimals
})

function handleSubaccountTransfer() {
  if (
    formValues[SubaccountTransferField.SrcSubaccountId] ===
    walletStore.defaultSubaccountId
  ) {
    return handleDefaultSubaccountTransfer()
  }

  if (
    formValues[SubaccountTransferField.DstSubaccountId] ===
    walletStore.defaultSubaccountId
  ) {
    return handleDefaultSubaccountWithdraw()
  }

  return handleNonDefaultSubaccountTransfer()
}

function handleNonDefaultSubaccountTransfer() {
  status.setLoading()

  accountStore
    .externalTransfer({
      amount: new BigNumberInBase(formValues[SubaccountTransferField.Amount]),
      denom: formValues[SubaccountTransferField.Denom],
      srcSubaccountId: formValues[SubaccountTransferField.SrcSubaccountId],
      dstSubaccountId: formValues[SubaccountTransferField.DstSubaccountId],
      token: formValues[SubaccountTransferField.Token]
    })
    .then(() => {
      success({ title: t('bridge.transferToSubaccountSuccess') })
      resetForm()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function handleDefaultSubaccountTransfer() {
  status.setLoading()

  accountStore
    .deposit({
      amount: new BigNumberInBase(formValues[SubaccountTransferField.Amount]),
      subaccountId: formValues[SubaccountTransferField.DstSubaccountId],
      token: formValues[SubaccountTransferField.Token]
    })
    .then(() => {
      success({ title: t('bridge.transferToSubaccountSuccess') })
      resetForm()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function handleDefaultSubaccountWithdraw() {
  status.setLoading()

  accountStore
    .withdraw({
      amount: new BigNumberInBase(formValues[SubaccountTransferField.Amount]),
      subaccountId: formValues[SubaccountTransferField.SrcSubaccountId],
      token: formValues[SubaccountTransferField.Token]
    })
    .then(() => {
      success({ title: t('bridge.transferToSubaccountSuccess') })
      resetForm()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function handleTokenChange() {
  nextTick(() => {
    const token = supplyWithBalance.value.find(
      (token) => token.denom === formValues[SubaccountTransferField.Denom]
    )

    if (token) {
      formValues[SubaccountTransferField.Amount] = ''
      formValues[SubaccountTransferField.Token] = token.token
    }
  })
}

function handleAmountChange({ amount }: { amount: string }) {
  formValues[SubaccountTransferField.Amount] = amount
}

function handleSubaccountIdChange() {
  nextTick(() => {
    formValues[SubaccountTransferField.Amount] = ''
    formValues[SubaccountTransferField.Token] = injToken
    formValues[SubaccountTransferField.Denom] = injToken.denom
  })
}

function resetForm() {
  const srcSubaccountId = formValues[SubaccountTransferField.SrcSubaccountId]
  const dstSubaccountId = formValues[SubaccountTransferField.DstSubaccountId]

  resetSubaccountTransferForm()

  formValues[SubaccountTransferField.SrcSubaccountId] = srcSubaccountId
  formValues[SubaccountTransferField.DstSubaccountId] = dstSubaccountId
}

function closeModal() {
  modalStore.closeModal(Modal.SubaccountTransfer)
}
</script>

<template>
  <AppModal
    :show="modalStore.modals[Modal.SubaccountTransfer]"
    md
    :ignore="['.v-popper__inner']"
    @modal:closed="closeModal"
  >
    <template #title>
      <h3>
        {{ $t('account.subaccountTransfer') }}
      </h3>
    </template>

    <div>
      <div class="mt-6">
        <div>
          <ModalsSubaccountTransferSelect
            @update:subaccount-id="handleSubaccountIdChange"
          />
          <div v-if="supplyWithBalance.length > 0" class="mt-6">
            <AppSelectToken
              v-model:denom="formValues[SubaccountTransferField.Denom]"
              v-bind="{
                maxDecimals,
                required: true,
                amountFieldName: SubaccountTransferField.Amount,
                options: supplyWithBalance
              }"
              @update:max="handleAmountChange"
              @update:denom="handleTokenChange"
            >
              <span> {{ $t('bridge.amount') }} </span>
            </AppSelectToken>
          </div>
          <div v-else class="mt-6 text-center text-gray-300 text-sm">
            {{ t('bridge.noAssetToTransfer') }}
          </div>
        </div>
        <AppButton
          lg
          class="w-full text-blue-900 bg-blue-500 mt-6"
          :status="status"
          :disabled="hasFormErrors"
          @click="handleSubaccountTransfer"
        >
          <span class="font-semibold">
            {{ $t('account.transfer') }}
          </span>
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>

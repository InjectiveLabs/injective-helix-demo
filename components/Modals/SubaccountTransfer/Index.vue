<script lang="ts" setup>
import { injToken } from '@shared/data/token'
import { BigNumberInBase, Status } from '@injectivelabs/utils'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { Modal, SubaccountTransferField, SubaccountTransferForm } from '@/types'

const modalStore = useModalStore()
const accountStore = useAccountStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const {
  values: formValues,
  errors: formErrors,
  setValues: setFormValues,
  resetForm: resetSubaccountTransferForm
} = useForm<SubaccountTransferForm>({
  initialValues: {
    [SubaccountTransferField.SrcSubaccountId]:
      sharedWalletStore.defaultSubaccountId,
    [SubaccountTransferField.DstSubaccountId]: '',
    [SubaccountTransferField.Token]: injToken,
    [SubaccountTransferField.Denom]: injToken.denom,
    [SubaccountTransferField.Amount]: ''
  },
  keepValuesOnUnmount: true
})

const { value: denomValue } = useStringField({
  name: SubaccountTransferField.Denom,
  rule: ''
})

const isDisabled = computed(
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

function onSubaccountTransfer() {
  if (
    formValues[SubaccountTransferField.SrcSubaccountId] ===
    sharedWalletStore.defaultSubaccountId
  ) {
    return defaultSubaccountTransfer()
  }

  if (
    formValues[SubaccountTransferField.DstSubaccountId] ===
    sharedWalletStore.defaultSubaccountId
  ) {
    return defaultSubaccountWithdraw()
  }

  return nonDefaultSubaccountTransfer()
}

function nonDefaultSubaccountTransfer() {
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
      notificationStore.success({
        title: t('account.transferToSubaccountSuccess')
      })
      resetForm()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
      closeModal()
    })
}

function defaultSubaccountTransfer() {
  status.setLoading()

  accountStore
    .deposit({
      amount: new BigNumberInBase(formValues[SubaccountTransferField.Amount]),
      subaccountId: formValues[SubaccountTransferField.DstSubaccountId],
      token: formValues[SubaccountTransferField.Token]
    })
    .then(() => {
      notificationStore.success({
        title: t('account.transferToSubaccountSuccess')
      })
      resetForm()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
      closeModal()
    })
}

function defaultSubaccountWithdraw() {
  status.setLoading()

  accountStore
    .withdraw({
      amount: new BigNumberInBase(formValues[SubaccountTransferField.Amount]),
      subaccountId: formValues[SubaccountTransferField.SrcSubaccountId],
      token: formValues[SubaccountTransferField.Token]
    })
    .then(() => {
      notificationStore.success({
        title: t('account.transferToSubaccountSuccess')
      })
      resetForm()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
      closeModal()
    })
}

function onTokenChange() {
  nextTick(() => {
    const token = supplyWithBalance.value.find(
      (token) => token.denom === formValues[SubaccountTransferField.Denom]
    )

    if (token) {
      setFormValues({
        [SubaccountTransferField.Amount]: '',
        [SubaccountTransferField.Token]: token.token
      })
    }
  })
}

function onAmountChange({ amount }: { amount: string }) {
  setFormValues({
    [SubaccountTransferField.Amount]: amount
  })
}

function onSubaccountIdChange() {
  nextTick(() => {
    setFormValues({
      [SubaccountTransferField.Amount]: '',
      [SubaccountTransferField.Token]: injToken,
      [SubaccountTransferField.Denom]: injToken.denom
    })
  })
}

function resetForm() {
  const srcSubaccountId = formValues[SubaccountTransferField.SrcSubaccountId]
  const dstSubaccountId = formValues[SubaccountTransferField.DstSubaccountId]

  resetSubaccountTransferForm()

  setFormValues({
    [SubaccountTransferField.SrcSubaccountId]: srcSubaccountId,
    [SubaccountTransferField.DstSubaccountId]: dstSubaccountId
  })
}

function closeModal() {
  modalStore.closeModal(Modal.SubaccountTransfer)
}
</script>

<template>
  <AppModal
    :is-open="modalStore.modals[Modal.SubaccountTransfer]"
    is-md
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
            @update:subaccount-id="onSubaccountIdChange"
          />
          <div v-if="supplyWithBalance.length > 0" class="mt-6">
            <AppSelectToken
              v-model:denom="denomValue"
              v-bind="{
                maxDecimals,
                isRequired: true,
                amountFieldName: SubaccountTransferField.Amount,
                options: supplyWithBalance
              }"
              @update:max="onAmountChange"
              @update:denom="onTokenChange"
            >
              <span> {{ $t('account.amount') }} </span>
            </AppSelectToken>
          </div>
          <div v-else class="mt-6 text-center text-coolGray-300 text-sm">
            {{ t('account.noAssetToTransfer') }}
          </div>
        </div>

        <AppButton
          size="lg"
          class="w-full text-blue-900 bg-blue-500 mt-6"
          :is-loading="status.isLoading()"
          :disabled="isDisabled"
          @click="onSubaccountTransfer"
        >
          <span class="font-semibold">
            {{ $t('account.transfer') }}
          </span>
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { redeemVoucher } from '@/app/client/voucher'
import { Modal } from '@/types'

const modalStore = useModalStore()
const walletStore = useSharedWalletStore()

const { validate, resetForm } = useForm<{ voucherId: string }>()

const { value: voucherId, errorMessage } = useStringField({
  name: 'voucherId',
  initialValue: '',
  rule: 'required|fixedCharacters:6'
})

const isSuccess = ref(false)
const status = reactive(new Status(StatusType.Idle))
const { $onError } = useNuxtApp()
const { error } = useSharedNotificationStore()
const { t } = useLang()

function onModalClose() {
  isSuccess.value = false
  resetForm()

  modalStore.closeModal(Modal.RedeemVoucher)
}

async function onRedeem() {
  if (!walletStore.isUserConnected) {
    modalStore.openModal(Modal.Terms)

    return
  }

  const { valid } = await validate()

  if (!valid) {
    return
  }

  status.setLoading()

  redeemVoucher({
    address: walletStore.injectiveAddress,
    voucherId: voucherId.value
  })
    .then(() => {
      isSuccess.value = true
    })
    .catch((e: any) => {
      error({
        title: t('common.error'),
        description: e.response.data.message
      })

      $onError(e)
    })
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <AppModal
    is-sm
    :is-open="modalStore.modals[Modal.RedeemVoucher]"
    @modal:closed="onModalClose"
  >
    <div v-if="!isSuccess" class="items-center text-white">
      <img class="mx-auto" src="/svg/voucher.svg" alt="Voucher" />
      <div class="text-center">
        <h3 class="text-xl font-bold mt-4">
          {{ $t('voucher.redeemVoucher') }}
        </h3>

        <p class="mt-4 text-sm text-gray-200">
          {{ $t('voucher.redeemVoucherDescription') }}
        </p>
      </div>

      <div class="mt-4">
        <p class="text-sm font-semibold mb-2">
          {{ $t('voucher.enterVoucherCode') }}
        </p>
        <AppInput
          v-model="voucherId"
          class="p-2"
          placeholder="Enter your voucher code"
        />
      </div>

      <p v-if="errorMessage" class="text-red-500 text-sm mt-2">
        {{ errorMessage }}
      </p>

      <div class="mt-4" @click="onRedeem">
        <AppButton v-bind="{ status }" primary class="w-full">
          {{ $t('voucher.redeem') }}
        </AppButton>
      </div>
    </div>

    <CommonSuccessMessage
      v-if="isSuccess"
      :title="$t('voucher.voucherRedeemed')"
    />
  </AppModal>
</template>

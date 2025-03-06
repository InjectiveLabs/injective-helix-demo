<script setup lang="ts">
import { MsgType } from '@injectivelabs/ts-types'
import { Status, StatusType } from '@injectivelabs/utils'
import { TRADING_MESSAGES } from '@/app/data/trade'
import { Modal } from '@/types'

const authZStore = useAuthZStore()
const modalStore = useSharedModalStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const { validate } = useForm<{
  address: string
}>()

const msgs = ref(TRADING_MESSAGES)
const status = reactive(new Status(StatusType.Idle))

const {
  errorMessage,
  value: addressValue,
  resetField: resetAddressValue
} = useStringField({
  name: 'address',
  rule: 'required|injAddress'
})

async function grantAuthorization() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  status.setLoading()

  authZStore
    .grantAuthorization({
      grantee: addressValue.value,
      messageTypes: msgs.value
    })
    .then(() => notificationStore.success({ title: t('common.success') }))
    .catch($onError)
    .finally(() => {
      status.setIdle()

      modalStore.closeModal(Modal.AddGrantee)
    })
}

function onOpenModal() {
  resetAddressValue({ value: '' })
}
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.AddGrantee]"
    v-bind="{ isMd: true }"
    @on:open="onOpenModal"
  >
    <template #title>
      <h3>
        {{ $t('portfolio.settings.authz.addNewGrantee') }}
      </h3>
    </template>

    <div>
      <p class="text-sm font-semibold mb-2">
        {{ $t('connect.walletAddress') }}
      </p>

      <input
        v-model="addressValue"
        type="text"
        class="input-style outline-none w-full p-2 text-sm"
        :placeholder="$t('connect.walletAddress')"
      />

      <p class="error-message mt-2">{{ errorMessage }}</p>

      <div
        class="max-h-[230px] overflow-auto border rounded-md p-2 my-2 grid grid-cols-1 lg:grid-cols-2 whitespace-nowrap text-sm gap-4 lg:gap-2"
      >
        <PartialsPortfolioSettingsAuthzGranteeCommonMsgSelect
          v-for="[label, value] in Object.entries(MsgType).filter((entry) =>
            TRADING_MESSAGES.includes(entry[1])
          )"
          :key="label"
          v-bind="{ value, label }"
          v-model="msgs"
        />
      </div>

      <div class="mt-4">
        <AppButton
          v-bind="{ status }"
          :disabled="!!errorMessage || msgs.length === 0"
          class="w-full"
          variant="primary"
          @click="grantAuthorization"
        >
          Add Authz
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>

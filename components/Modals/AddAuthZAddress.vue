<script setup lang="ts">
import { MsgType } from '@injectivelabs/ts-types'
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal } from '~/types'

const tradingMessages = [
  MsgType.MsgCreateSpotLimitOrder,
  MsgType.MsgCreateSpotMarketOrder,
  MsgType.MsgCreateDerivativeLimitOrder,
  MsgType.MsgCreateDerivativeMarketOrder,
  MsgType.MsgCancelSpotOrder,
  MsgType.MsgCancelDerivativeOrder,
  MsgType.MsgBatchCancelDerivativeOrders,
  MsgType.MsgBatchCancelSpotOrders,
  MsgType.MsgBatchCreateDerivativeLimitOrders,
  MsgType.MsgBatchCreateSpotLimitOrders,
  MsgType.MsgBatchUpdateOrders
]

const modalStore = useModalStore()
const authZStore = useAuthZStore()
const { $onError } = useNuxtApp()
const { success } = useNotifications()

const { validate } = useForm<{
  address: string
}>()

const msgs = ref(tradingMessages)
const status = reactive(new Status(StatusType.Idle))

const { value: addressValue, errorMessage } = useStringField({
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
    .then(() => {
      success({ title: 'Success!' })
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
      closeModal()
    })
}

const isOpen = computed(() => modalStore.modals[Modal.AddGrantee])

function closeModal() {
  modalStore.closeModal(Modal.AddGrantee)
}
</script>

<template>
  <AppModal is-md v-bind="{ isOpen }" @modal:closed="closeModal">
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
        class="max-h-[230px] overflow-auto border rounded-md p-2 my-2 grid grid-cols-2 whitespace-nowrap text-sm gap-2"
      >
        <PartialsPortfolioSettingsAuthzGranteeCommonMsgSelect
          v-for="[label, value] in Object.entries(MsgType).filter((entry) =>
            tradingMessages.includes(entry[1])
          )"
          :key="label"
          v-bind="{ value, label }"
          v-model="msgs"
        />
      </div>

      <div class="mt-4">
        <AppButton
          v-bind="{ status }"
          :disabled="errorMessage || msgs.length === 0"
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

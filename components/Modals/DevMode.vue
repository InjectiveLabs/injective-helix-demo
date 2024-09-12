<script lang="ts" setup>
import { Wallet } from '@injectivelabs/wallet-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal } from '@/types'

enum ConnectType {
  Address = 'address',
  PrivateKey = 'privateKey'
}

const modalStore = useModalStore()
const walletStore = useWalletStore()
const { t } = useLang()
const { resetForm } = useForm()
const { $onError } = useNuxtApp()
const { success } = useSharedNotificationStore()

const connectType = ref(ConnectType.Address)
const status = reactive(new Status(StatusType.Idle))

const { value: address, errors: addressErrors } = useStringField({
  name: ConnectType.Address,
  rule: '',
  dynamicRule: computed(() => {
    if (connectType.value === ConnectType.Address) {
      return 'required|injAddress'
    }

    return ''
  })
})

const { value: privateKey, errors: privateKeyErrors } = useStringField({
  name: ConnectType.PrivateKey,
  rule: '',
  dynamicRule: computed(() => {
    if (connectType.value === ConnectType.PrivateKey) {
      return 'required|privateKey'
    }

    return ''
  })
})

const isDisabled = computed(() => {
  if (connectType.value === ConnectType.Address) {
    return !address.value || addressErrors.value.length > 0
  }

  return !privateKey.value || privateKeyErrors.value.length > 0
})

const isModalOpen = computed(() => modalStore.modals[Modal.DevMode])

function closeModal() {
  resetForm()
  modalStore.closeModal(Modal.DevMode)
}

function connect() {
  if (connectType.value === ConnectType.Address) {
    connectViaAddress()

    return
  }

  connectViaPrivateKey()
}

function connectViaAddress() {
  if (!address.value) {
    return
  }

  status.setLoading()

  walletStore
    .connectAddressOrPrivatekey({
      addressOrPk: address.value
    })
    .then(() => success({ title: t('connect.successfullyConnected') }))
    .catch((e) => {
      walletStore.disconnect()
      $onError(e)
    })
    .finally(() => {
      status.setIdle()

      closeModal()
    })
}

function connectViaPrivateKey() {
  if (!privateKey.value) {
    return
  }

  status.setLoading()

  walletStore
    .connectAddressOrPrivatekey({
      wallet: Wallet.PrivateKey,
      addressOrPk: privateKey.value
    })
    .then(() => success({ title: t('connect.successfullyConnected') }))
    .catch((e) => {
      walletStore.disconnect()
      $onError(e)
    })
    .finally(() => {
      status.setIdle()

      closeModal()
    })
}
</script>

<template>
  <AppModal :is-open="isModalOpen" is-sm @modal:closed="closeModal">
    <template #title>
      <h3 class="text-base">
        {{ $t('devMode.connect') }}
      </h3>
    </template>

    <div class="space-x-2">
      <AppButtonSelect
        v-for="item in Object.values(ConnectType)"
        :key="`${item}-dev-mode-connect-type`"
        v-model="connectType"
        :value="item"
        @update:model-value="resetForm()"
      >
        <template #default="{ isActive }">
          <AppButton
            size="sm"
            :variant="isActive ? 'primary' : 'primary-outline'"
          >
            <div class="mx-auto leading-4">
              <span class="text-base capitalize">{{ item }}</span>
            </div>
          </AppButton>
        </template>
      </AppButtonSelect>

      <div class="mt-6 flex flex-wrap items-center justify-center">
        <div class="w-full">
          <AppInput
            v-if="connectType === ConnectType.Address"
            v-model="address"
            wrapper-classes="py-2 px-1"
            :placeholder="$t('devMode.enterInjectiveAddress')"
          />

          <AppInput
            v-if="connectType === ConnectType.PrivateKey"
            v-model="privateKey"
            wrapper-classes="py-2 px-1"
            :placeholder="$t('devMode.enterPrivateKey')"
          />
        </div>
        <div class="w-full mt-4 text-center">
          <AppButton
            is-lg
            variant="primary"
            :disabled="isDisabled"
            :is-loading="status.isLoading()"
            @click="connect"
          >
            {{ $t('devMode.connect') }}
          </AppButton>
        </div>
      </div>

      <div
        v-if="connectType === ConnectType.Address && addressErrors.length > 0"
      >
        <div class="mt-2 text-left text-sm capitalize-phrase">
          <span class="text-red-500">{{ addressErrors[0] }}</span>
        </div>
      </div>

      <div
        v-if="
          connectType === ConnectType.PrivateKey && privateKeyErrors.length > 0
        "
      >
        <div class="mt-2 text-left text-sm capitalize-phrase">
          <span class="text-red-500">{{ privateKeyErrors[0] }}</span>
        </div>
      </div>
    </div>
  </AppModal>
</template>

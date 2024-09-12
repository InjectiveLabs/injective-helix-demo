<script lang="ts" setup>
import { Wallet } from '@injectivelabs/wallet-ts'
import { SharedDropdownOption } from '@shared/types'
import { Status, StatusType } from '@injectivelabs/utils'
import * as WalletTracker from '@/app/providers/mixpanel/WalletTracker'

const walletStore = useWalletStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { handleSubmit } = useForm()

const options = [
  {
    display: Wallet.Trezor,
    value: Wallet.Trezor
  }
] as SharedDropdownOption[]

const wallet = ref<Wallet>(Wallet.Trezor)
const status = reactive(new Status(StatusType.Idle))
const fetchStatus = reactive(new Status(StatusType.Idle))

const { value: address, errors: addressErrors } = useStringField({
  name: 'address'
})

onMounted(() => {
  walletStore.$patch({
    hwAddresses: []
  })
})

function fetchAddresses() {
  fetchStatus.setLoading()

  sharedWalletStore
    .getHWAddresses(Wallet.Trezor)
    .catch($onError)
    .finally(() => {
      fetchStatus.setIdle()
    })
}

const connect = handleSubmit(() => {
  status.setLoading()

  walletStore
    .connect({
      wallet: Wallet.Trezor,
      address: address.value
    })
    .then(() => {
      notificationStore.success({ title: t('connect.successfullyConnected') })

      WalletTracker.trackLogin({
        wallet: sharedWalletStore.wallet,
        address: sharedWalletStore.injectiveAddress
      })
    })
    .catch((e) => {
      $onError(e)
    })
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <div>
    <p class="text-sm font-semibold mb-2">
      {{ $t('connect.derivationPath') }}
    </p>
    <AppSelectField
      v-model="wallet"
      :options="options"
      :placeholder="$t('connect.wallet')"
    />

    <p
      v-if="fetchStatus.isLoading()"
      class="text-gray-400 text-xs my-2 flex items-center gap-2"
    >
      <AppSpinner is-sm />
      <span>
        {{ $t('connect.getAddressNote') }}
      </span>
    </p>

    <div
      v-else
      class="flex items-center gap-1 text-blue-500 hover:text-opacity-80 cursor-pointer text-sm mt-2"
      @click="fetchAddresses"
    >
      <span>
        {{
          sharedWalletStore.hwAddresses.length === 0
            ? $t('connect.getAddresses')
            : $t('connect.getMoreAddresses')
        }}
      </span>
      <SharedIcon name="arrow" class="rotate-180 w-4 h-4" />
    </div>

    <div class="border-b border-gray-600 mt-4 mb-4" />

    <div v-if="sharedWalletStore.hwAddresses.length > 0">
      <p class="text-sm font-semibold mb-2">
        {{ $t('connect.address') }}
      </p>

      <AppSelectField
        v-model="address"
        is-searchable
        :options="
          sharedWalletStore.hwAddresses.map((address: string) => ({
            display: address,
            value: address
          }))
        "
        :placeholder="$t('connect.selectAddressToConnect')"
      />

      <p
        v-if="addressErrors.length > 0"
        class="text-red-500 text-sm capitalize-phrase mt-1"
      >
        {{ addressErrors[0] }}
      </p>

      <AppButton
        class="w-full mt-4 text-blue-900 bg-blue-500 font-semibold"
        :disabled="addressErrors.length > 0"
        :is-loading="status.isLoading()"
        size="lg"
        @click="connect"
      >
        {{ $t('connect.connect') }}
      </AppButton>
    </div>

    <p class="text-xs text-gray-400 mt-4">
      {{ $t('connect.connectUsingTrezorNote') }}
    </p>
  </div>
</template>

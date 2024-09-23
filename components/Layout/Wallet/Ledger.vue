<script lang="ts" setup>
import { SharedDropdownOption } from '@shared/types'
import { Status, StatusType } from '@injectivelabs/utils'
import { LedgerDerivationPathType, Wallet } from '@injectivelabs/wallet-ts'

const walletStore = useWalletStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { $onError } = useNuxtApp()
const { t } = useLang()
const { handleSubmit } = useForm()

const options = [
  {
    display: t('connect.ledgerLive'),
    value: LedgerDerivationPathType.LedgerLive
  },
  {
    display: t('connect.ledgerLegacy'),
    value: LedgerDerivationPathType.LedgerMew
  }
] as SharedDropdownOption[]

const path = ref<LedgerDerivationPathType>(LedgerDerivationPathType.LedgerLive)
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

  const wallet =
    path.value === LedgerDerivationPathType.LedgerLive
      ? Wallet.Ledger
      : Wallet.LedgerLegacy

  sharedWalletStore
    .getHWAddresses(wallet)
    .catch($onError)
    .finally(() => {
      fetchStatus.setIdle()
    })
}

const connect = handleSubmit(() => {
  status.setLoading()

  const wallet =
    path.value === LedgerDerivationPathType.LedgerMew
      ? Wallet.LedgerLegacy
      : Wallet.Ledger

  walletStore
    .connect({
      wallet,
      address: address.value
    })
    .then(() =>
      notificationStore.success({ title: t('connect.successfullyConnected') })
    )
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
      v-model="path"
      :options="options"
      :placeholder="$t('connect.selectDerivationPath')"
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
      {{ $t('connect.connectUsingLedgerNote') }}
    </p>
  </div>
</template>

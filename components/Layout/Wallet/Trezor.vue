<script lang="ts" setup>
import { Wallet } from '@injectivelabs/wallet-base'
import { Status, StatusType } from '@injectivelabs/utils'
import { getEthereumAddress } from '@injectivelabs/sdk-ts'
import { SharedDropdownOption, NuxtUiIcons } from '@shared/types'

const toast = useToast()
const walletStore = useWalletStore()
const sharedWalletStore = useSharedWalletStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { handleSubmit } = useForm()

const options = [
  {
    display: t('connect.trezorLegacy'),
    value: Wallet.TrezorLegacy
  }
] as SharedDropdownOption[]

const wallet = ref<Wallet>(Wallet.TrezorLegacy)
const status = reactive(new Status(StatusType.Idle))
const fetchStatus = reactive(new Status(StatusType.Idle))

const { value: address, errors: addressErrors } = useStringField({
  name: 'address'
})

const walletOptions = computed(() =>
  sharedWalletStore.hwAddresses.map((address: string) => ({
    display: address,
    description: getEthereumAddress(address),
    value: address
  }))
)

onMounted(() => {
  sharedWalletStore.$patch({
    hwAddresses: []
  })
})

function fetchAddresses() {
  fetchStatus.setLoading()

  sharedWalletStore
    .getHWAddresses(Wallet.TrezorLegacy)
    .catch($onError)
    .finally(() => {
      fetchStatus.setIdle()
    })
}

const connect = handleSubmit(() => {
  status.setLoading()

  walletStore
    .connect({
      wallet: Wallet.TrezorLegacy,
      address: address.value
    })
    .then(() =>
      toast.add({
        title: t('connect.successfullyConnected')
      })
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
    <USelectMenu
      v-model="wallet"
      :options="options"
      size="md"
      value-attribute="value"
      option-attribute="display"
      :placeholder="$t('connect.wallet')"
    />

    <p
      v-if="fetchStatus.isLoading()"
      class="text-coolGray-400 text-xs my-2 flex items-center gap-2"
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
      <UIcon :name="NuxtUiIcons.ArrowLeft" class="h-4 w-4 rotate-180" />
    </div>

    <div class="border-b border-coolGray-600 mt-4 mb-4" />

    <div v-if="sharedWalletStore.hwAddresses.length > 0">
      <p class="text-sm font-semibold mb-2">
        {{ $t('connect.address') }}
      </p>

      <USelectMenu
        v-model="address"
        size="md"
        color="cool-gray"
        value-attribute="value"
        select-class="min-w-max"
        option-attribute="display"
        :placeholder="$t('connect.selectAddressToConnect')"
        :options="walletOptions"
      >
        <template #option="{ option }">
          <div>
            <p>{{ option.display }}</p>
            <p class="text-coolGray-475 text-sm">{{ option.description }}</p>
          </div>
        </template>
      </USelectMenu>

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

    <p class="text-xs text-coolGray-400 mt-4">
      {{ $t('connect.connectUsingTrezorNote') }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { formatWalletAddress } from '@injectivelabs/utils'
import { Wallet } from '@injectivelabs/wallet-ts'
import { Modal } from '@/types'

const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { copy } = useClipboard()

defineProps({
  wallet: {
    required: true,
    type: String as PropType<Wallet>
  }
})

const modalStore = useModalStore()

const isDropdownVisible = ref(false)

const formattedInjectiveAddress = computed(() =>
  formatWalletAddress(sharedWalletStore.injectiveAddress)
)
const formattedAddress = computed(() =>
  formatWalletAddress(sharedWalletStore.address)
)

function onToggleDropdown() {
  isDropdownVisible.value = !isDropdownVisible.value
}

function onCopyAddress() {
  copy(sharedWalletStore.address)
  notificationStore.success({ title: t('connect.copiedAddress') })
}

function onCopyInjectiveAddress() {
  copy(sharedWalletStore.injectiveAddress)
  notificationStore.success({ title: t('connect.copiedAddress') })
}

function openQrCodeModal() {
  modalStore.openModal(Modal.QrCode)
}
</script>

<template>
  <div class="flex flex-col text-white">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <SharedIcon :name="`wallet/${wallet}`" class="h-6 w-6" />
        <p class="font-mono text-sm font-medium">
          {{ formattedInjectiveAddress }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <AssetQRCode
          class="hover:text-blue-500 h-4 w-4"
          @click="openQrCodeModal"
        />

        <SharedIcon
          name="copy-filled"
          class="hover:text-blue-500 h-4 w-4"
          @click.stop="onCopyInjectiveAddress"
        />

        <SharedIcon
          name="caret-down"
          class="h-6 w-6 transition duration-500 hover:text-blue-500"
          :class="{ '-rotate-180': isDropdownVisible }"
          @click="onToggleDropdown"
        />
      </div>
    </div>
    <transition
      enter-active-class="ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isDropdownVisible" class="ml-8 mt-4 flex flex-col gap-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold">
            {{ $t('connect.walletAddress') }}
          </span>

          <div class="flex items-center gap-2">
            <span>{{ formattedAddress }}</span>
            <SharedIcon
              name="copy-filled"
              class="hover:text-blue-500 h-4 w-4"
              @click="onCopyAddress"
            />
          </div>
        </div>
        <LayoutWalletDetailsTierLevel
          v-if="!sharedWalletStore.isAuthzWalletConnected"
        />
      </div>
    </transition>
  </div>
</template>

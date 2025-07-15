<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { sharedEllipsisFormatText } from '@shared/utils/formatter'
import { DEFAULT_TRUNCATE_LENGTH } from '@/app/utils/constants'
import { Modal, PortfolioSubPage } from '@/types'
import type { Wallet } from '@injectivelabs/wallet-base'

const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { copy } = useClipboard()

withDefaults(defineProps<{ wallet: Wallet }>(), {})

const modalStore = useSharedModalStore()

const isDropdownVisible = ref(false)

const formattedInjectiveAddress = computed(() =>
  sharedEllipsisFormatText(
    sharedWalletStore.injectiveAddress,
    DEFAULT_TRUNCATE_LENGTH
  )
)

const formattedAddress = computed(() =>
  sharedEllipsisFormatText(sharedWalletStore.address, DEFAULT_TRUNCATE_LENGTH)
)

const formattedAuthZAddress = computed(() => {
  if (!sharedWalletStore.isAuthzWalletConnected) {
    return ''
  }

  return sharedEllipsisFormatText(
    sharedWalletStore.authZOrInjectiveAddress,
    DEFAULT_TRUNCATE_LENGTH
  )
})

function onToggleDropdown() {
  isDropdownVisible.value = !isDropdownVisible.value
}

function onCopyAddress() {
  copy(sharedWalletStore.address)
  notificationStore.success({ title: t('toast.copiedAddressToClipboard') })
}

function onCopyInjectiveAddress() {
  copy(sharedWalletStore.injectiveAddress)
  notificationStore.success({ title: t('toast.copiedAddressToClipboard') })
}

function openQrCodeModal() {
  modalStore.openModal(Modal.QrCode)
}
</script>

<template>
  <div class="flex flex-col text-white">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3 w-full">
        <div class="relative">
          <SharedLogoWhite class="h-8 w-8" />
          <SharedIcon
            :name="`wallet/${wallet}`"
            class="h-4 w-4 absolute -right-1 -bottom-1"
          />
        </div>
        <div class="w-full">
          <p class="text-coolGray-450 text-2xs font-medium">
            {{ $t('connect.injectiveAddress') }}
          </p>
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">
              {{ formattedInjectiveAddress }}
            </p>

            <div class="flex items-center gap-4">
              <UIcon
                :name="NuxtUiIcons.QrCode"
                class="hover:text-blue-500 h-4 w-4"
                @click="openQrCodeModal"
              />

              <UIcon
                :name="NuxtUiIcons.Copy2"
                class="hover:text-blue-500 h-4 w-4"
                @click.stop="onCopyInjectiveAddress"
              />

              <UIcon
                :name="NuxtUiIcons.ChevronUp2"
                class="hover:text-blue-500 transition duration-500 h-3 w-3 rotate"
                :class="{ 'rotate-180': isDropdownVisible }"
                @click="onToggleDropdown"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template
      v-if="
        sharedWalletStore.isAutoSignEnabled ||
        sharedWalletStore.isAuthzWalletConnected
      "
    >
      <section class="mt-1 flex items-baseline">
        <div
          class="border border-coolGray-450 border-t-0 border-r-0 w-5 h-5 rounded-bl-md ml-4"
        />

        <NuxtLink
          v-if="sharedWalletStore.isAuthzWalletConnected"
          :to="{ name: PortfolioSubPage.SettingsAuthz }"
          class="rounded px-2 py-1 flex items-center text-2xs bg-green-500 text-black gap-x-2 cursor-pointer"
        >
          <span class="underline font-semibold">
            {{
              $t('portfolio.authZ.authZAs', { address: formattedAuthZAddress })
            }}
          </span>
          <UIcon :name="NuxtUiIcons.ExternalLink2" />
        </NuxtLink>

        <div
          v-else
          class="rounded px-2 py-1 flex items-center text-2xs bg-green-500 text-black gap-x-1"
        >
          <span class="underline font-semibold">
            {{ $t('portfolio.autoSign.title') }}
          </span>
          <UIcon :name="NuxtUiIcons.RotateAuto" />
        </div>
      </section>
    </template>

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

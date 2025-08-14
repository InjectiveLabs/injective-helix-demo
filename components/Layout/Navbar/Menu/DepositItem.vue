<script lang="ts" setup>
import { GEO_IP_RESTRICTIONS_ENABLED } from '@shared/utils/constant'
import { Modal } from '@/types'

const appStore = useAppStore()
const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()

withDefaults(
  defineProps<{
    label: string
  }>(),
  {}
)

function connect() {
  if (GEO_IP_RESTRICTIONS_ENABLED && !appStore.userState.hasAcceptedTerms) {
    modalStore.openModal(Modal.Terms)
  } else {
    modalStore.openModal(Modal.Connect)
  }
}

function onFiatOnRamp() {
  if (sharedWalletStore.isUserConnected) {
    modalStore.openModal(Modal.Onboard)
  } else {
    connect()
  }
}
</script>

<template>
  <div @click="onFiatOnRamp">
    <slot>
      <div
        class="px-3 py-1.5 hover:text-blue-550 flex items-center text-xs cursor-pointer select-none text-white"
      >
        <div class="inline-block">
          {{ $t(label) }}
        </div>
      </div>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { Modal } from '@/types'

const modalStore = useSharedModalStore()

withDefaults(
  defineProps<{
    label: string
  }>(),
  {}
)

function onFiatOnRamp() {
  modalStore.openModal(Modal.FiatOnboard)
}
</script>

<template>
  <div @click="onFiatOnRamp">
    <slot>
      <div
        class="group/item block text-xs text-white hover:text-blue-550 font-semibold w-full rounded p-1 cursor-pointer"
      >
        <div class="inline-block">
          {{ $t(label) }}
        </div>
      </div>
    </slot>
  </div>
</template>

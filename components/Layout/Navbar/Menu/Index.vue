<script setup lang="ts">
import { MENU_ITEMS } from '@/app/data/menu'
import { Modal } from '~/types'

const appStore = useAppStore()

const filteredMenuItems = computed(() =>
  MENU_ITEMS.filter((item) => (!appStore.devMode ? !item.devOnly : item))
)

const modalStore = useModalStore()

function openLiteBridge() {
  modalStore.openModal(Modal.LiteBridge)
}
</script>

<template>
  <div class="flex p-2 max-lg:hidden">
    <LayoutNavbarMenuItem
      v-for="item in filteredMenuItems"
      :key="item.label"
      v-bind="{ item }"
    />

    <button
      v-if="appStore.devMode"
      class="text-sm font-semibold"
      @click="openLiteBridge"
    >
      Open Bridge
    </button>
  </div>
</template>

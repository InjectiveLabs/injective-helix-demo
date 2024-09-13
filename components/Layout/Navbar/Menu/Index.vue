<script setup lang="ts">
import { MENU_ITEMS } from '@/app/data/menu'
import { MenuItemType, Modal } from '@/types'

const appStore = useAppStore()
const modalStore = useModalStore()

const menuItems = MENU_ITEMS.map((item) => {
  if (
    item.label === 'navigation.trade' &&
    item.type === MenuItemType.Dropdown
  ) {
    return {
      ...item,
      items: item.items.map((subItem) => {
        if (subItem.label === 'voucher.redeemVoucher') {
          return {
            ...subItem,
            click: () => {
              modalStore.openModal(Modal.RedeemVoucher)
            }
          }
        }

        return subItem
      })
    }
  }

  return item
})

const filteredMenuItems = computed(() =>
  menuItems.filter((item) => (!appStore.devMode ? !item.devOnly : item))
)

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

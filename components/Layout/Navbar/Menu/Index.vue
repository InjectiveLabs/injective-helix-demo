<script setup lang="ts">
import { MENU_ITEMS } from '@/app/data/menu'
import { MenuItemType, Modal } from '@/types'

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

const appStore = useAppStore()
const modalStore = useModalStore()

const filteredMenuItems = computed(() =>
  menuItems.filter((item) => (!appStore.devMode ? !item.devOnly : item))
)
</script>

<template>
  <div class="flex p-2 max-lg:hidden">
    <LayoutNavbarMenuItem
      v-for="item in filteredMenuItems"
      :key="item.label"
      v-bind="{ item }"
    />
  </div>
</template>

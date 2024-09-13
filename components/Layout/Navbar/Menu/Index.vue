<script setup lang="ts">
import { MENU_ITEMS } from '@/app/data/menu'
<<<<<<< HEAD
import { MenuItemType, Modal } from '@/types'
=======
>>>>>>> 43058351 (chore: lite widget finalize)

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
<<<<<<< HEAD

function openLiteBridge() {
  modalStore.openModal(Modal.LiteBridge)
}
=======
>>>>>>> 43058351 (chore: lite widget finalize)
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

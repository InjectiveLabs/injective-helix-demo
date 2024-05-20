<script setup lang="ts">
import { MENU_ITEMS, USER_MENU_ITEMS, DEPOSIT_MENU_ITEM } from '@/app/data/menu'
import { MenuItemType } from '@/types'

const walletStore = useWalletStore()

const isOpen = ref(false)

function close() {
  isOpen.value = false
  isLocked.value = false
  isLockedDoc.value = false
}

function open() {
  isOpen.value = true
  isLocked.value = true
  isLockedDoc.value = true
}

const isLocked = useScrollLock(document.body)
const isLockedDoc = useScrollLock(document.documentElement)
</script>

<template>
  <div class="flex items-center pr-2 lg:hidden">
    <button
      class="hover:bg-brand-800 p-1 transition-all rounded-md select-none"
      @click="open"
    >
      <SharedIcon name="menu" />
    </button>
  </div>

  <Teleport to="body">
    <Transition name="menu-fade-in" mode="out-in">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/20 z-50 backdrop-blur-sm mobile-menu"
        @click="close"
      >
        <div
          class="bg-brand-900 border-r border-brand-700 max-w-sm h-full mobile-menu-content"
          @click.stop
        >
          <div class="h-[100dvh] max-w-sm overflow-y-auto">
            <div class="p-4 border-b flex justify-between items-center">
              <AssetLogo class="mx-3" />
              <SharedIcon name="close" @click="close" />
            </div>

            <div>
              <div class="p-4 font-semibold border-b">
                <LayoutNavbarPortfolioMenuItem
                  v-if="walletStore.isUserWalletConnected"
                  v-bind="{
                    item: {
                      label: 'portfolio',
                      type: MenuItemType.Dropdown,
                      items: USER_MENU_ITEMS
                    }
                  }"
                  @menu:close="close"
                />

                <LayoutNavbarPortfolioMenuItem
                  v-for="item in MENU_ITEMS"
                  :key="item.label"
                  v-bind="{ item }"
                  @menu:close="close"
                />

                <LayoutNavbarPortfolioMenuItem
                  v-bind="{ item: DEPOSIT_MENU_ITEM }"
                  @menu:close="close"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.menu-fade-in-enter-active,
.menu-fade-in-leave-active {
  transition: all 0.3s;
}

.menu-fade-in-enter-from,
.menu-fade-in-leave-to {
  opacity: 0;
}

.mobile-menu-content {
  transition: transform 0.3s;
}

.menu-fade-in-enter-from .mobile-menu-content,
.menu-fade-in-leave-to .mobile-menu-content {
  transform: translateX(-100%);
}
</style>

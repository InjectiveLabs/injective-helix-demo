<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { MOBILE_MENU_ITEMS } from '@/app/data/menu'

const appStore = useAppStore()
const sharedWalletStore = useSharedWalletStore()

const isOpen = ref(false)

const filteredMenuItems = computed(() =>
  MOBILE_MENU_ITEMS.filter((item) => {
    if (item.isDevOnly) {
      return appStore.devMode
    }

    if (item.isConnectedOnly) {
      return sharedWalletStore.isUserConnected
    }

    return true
  })
)

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
      <UIcon :name="NuxtUiIcons.Menu" class="h-6 w-6 min-w-6" />
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
              <UIcon
                :name="NuxtUiIcons.Close"
                class="h-4 w-4 min-w-4"
                @click="close"
              />
            </div>

            <div>
              <div class="p-4 font-semibold border-b">
                <LayoutNavbarPortfolioMenuItem
                  v-for="item in filteredMenuItems"
                  :key="item.label"
                  v-bind="{ item }"
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

<script setup lang="ts">
import { MENU_ITEMS, getDepositMenuItem } from '@/app/data/menu'

const appStore = useAppStore()

const depositMenuItem = getDepositMenuItem()

const filteredMenuItems = computed(() => [
  ...MENU_ITEMS.filter((item) => (!appStore.devMode ? !item.devOnly : item)),
  depositMenuItem
])
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

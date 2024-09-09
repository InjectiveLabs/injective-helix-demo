<script setup lang="ts">
import { MENU_ITEMS } from '@/app/data/menu'

const appStore = useAppStore()

const filteredMenuItems = computed(() =>
  MENU_ITEMS.filter((item) => (!appStore.devMode ? !item.devOnly : item))
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

<script setup lang="ts">
import { TOP_NAV_MENU } from '@/app/data/menu'

const appStore = useAppStore()

const filteredTopNavMenu = computed(() =>
  TOP_NAV_MENU.filter((item) => {
    if (item.isDevOnly && !appStore.devMode) return false
    return true
  })
)
</script>

<template>
  <div class="flex p-1.5 max-lg:hidden">
    <LayoutNavbarMenuItem
      v-for="item in filteredTopNavMenu"
      :key="item.label"
      :item="item"
    />
  </div>
</template>

<script setup lang="ts">
import { USER_MENU_ITEMS } from '@/app/data/menu'
</script>

<template>
  <div class="p-4">
    <LayoutNavbarPortfolioMenuItem
      v-for="item in USER_MENU_ITEMS"
      :key="item.label"
      v-bind="{ item }"
    />
  </div>
</template>

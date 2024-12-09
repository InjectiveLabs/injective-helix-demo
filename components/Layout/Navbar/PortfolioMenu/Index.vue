<script setup lang="ts">
import { PORTFOLIO_MENU_ITEMS } from '@/app/data/menu'
</script>

<template>
  <div class="p-4 font-semibold">
    <LayoutNavbarPortfolioMenuItem
      v-for="item in PORTFOLIO_MENU_ITEMS"
      :key="item.label"
      v-bind="{ item }"
    />
  </div>
</template>

<script setup lang="ts">
import { MENU_ITEMS } from '@/app/data/menu'
</script>

<template>
  <div class="flex p-2">
    <LayoutNavbarMenuItem
      v-for="item in MENU_ITEMS"
      :key="item.label"
      v-bind="{ item }"
    />
  </div>
</template>

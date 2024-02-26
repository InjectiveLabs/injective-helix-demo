<script setup lang="ts">
import { MenuItemType } from '@/types'

//
</script>

<template>
  <div class="flex p-2 space-x-2">
    <div class="flex">
      <LayoutNavbarMenuItem
        v-bind="{
          item: {
            label: 'portfolio',
            type: MenuItemType.Link,
            to: '/portfolio'
          }
        }"
      />
    </div>

    <button
      class="px-6 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold"
    >
      Connect Wallet
    </button>
  </div>
</template>

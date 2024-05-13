<script setup lang="ts">
import { MenuItemType } from '@/types'

//
</script>

<template>
  <div class="flex p-2 space-x-2">
    <div class="flex">
      <LayoutNavbarMenuItem
        class="hidden lg:block"
        v-bind="{
          item: {
            label: 'portfolio',
            type: MenuItemType.Link,
            to: '/portfolio'
          }
        }"
      />
    </div>

    <LayoutWallet />
  </div>
</template>

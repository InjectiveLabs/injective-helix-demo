<script setup lang="ts">
import { MenuItem, MenuItemType } from '@/types'

defineProps({
  item: {
    type: Object as PropType<MenuItem>,
    required: true
  }
})

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <NuxtLink
    v-if="item.type === MenuItemType.Link"
    :to="item.to"
    class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-800 cursor-pointer border border-transparent"
  >
    <component :is="item.icon" v-if="item.icon" />

    <div>{{ $t(`navigation.${item.label}`) }}</div>
  </NuxtLink>

  <template v-else>
    <div
      class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-800 select-none cursor-pointer border border-transparent"
      @click="toggle"
    >
      <component :is="item.icon" v-if="item.icon" />

      <div class="flex-1">{{ $t(`navigation.${item.label}`) }}</div>

      <BaseIcon
        name="chevron"
        class="transition-all"
        :class="{
          'rotate-180': !isOpen,
          'rotate-90': isOpen
        }"
        is-sm
      />
    </div>

    <div v-if="isOpen" class="pl-6">
      <LayoutNavbarPortfolioMenuItem
        v-for="subItem in item.items"
        :key="subItem.label"
        v-bind="{ item: subItem }"
      />
    </div>
  </template>
</template>

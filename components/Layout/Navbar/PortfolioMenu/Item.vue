<script setup lang="ts">
import { MenuItem, MenuItemType } from '@/types'

defineProps({
  item: {
    type: Object as PropType<MenuItem>,
    required: true
  }
})

const emit = defineEmits<{
  'menu:close': []
}>()

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <NuxtLink
    v-if="item.type === MenuItemType.Link"
    :to="item.to"
    class="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-800 cursor-pointer border border-transparent text-sm"
    @click="emit('menu:close')"
  >
    <component :is="item.icon" v-if="item.icon" />

    <div>{{ $t(`navigation.${item.label}`) }}</div>
  </NuxtLink>

  <template v-else>
    <div
      class="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-800 select-none cursor-pointer border border-transparent text-sm"
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
        @menu:close="emit('menu:close')"
      />
    </div>
  </template>
</template>

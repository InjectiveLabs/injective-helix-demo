<script setup lang="ts">
import { MenuItem, MenuItemType } from '@/types'

defineProps({
  item: {
    type: Object as PropType<MenuItem>,
    required: true
  }
})

const route = useRoute()

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
    :target="item?.isExternal ? '_blank' : ''"
    class="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-800 cursor-pointer border border-transparent text-sm"
    :class="{
      'text-blue-500 ': route.name === (item.to as any).name
    }"
    @click="emit('menu:close')"
  >
    <SharedIcon v-if="item.icon" :name="item.icon" is-md />

    <div>{{ $t(item.label) }}</div>
  </NuxtLink>

  <template v-else>
    <div
      class="flex nav-menu items-center space-x-3 p-3 rounded-md hover:bg-gray-800 select-none cursor-pointer border border-transparent text-sm"
      :class="{
        'text-blue-500 bg-brand-875': (route.name as string).startsWith(
          item.name as string
        )
      }"
      @click="toggle"
    >
      <SharedIcon v-if="item.icon" :name="item.icon" is-md />

      <div class="flex-1">
        {{ $t(item.label) }}
      </div>

      <SharedIcon
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

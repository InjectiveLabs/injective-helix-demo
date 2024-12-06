<script setup lang="ts">
import { LocationAsRelativeRaw } from 'vue-router'
import { NuxtUiIcons } from '@shared/types'
import { MenuItem, NavChild, NavLink, PortfolioCyTags } from '@/types'

const route = useRoute()

const props = withDefaults(defineProps<{ item: MenuItem }>(), {})

const emit = defineEmits<{
  'menu:close': []
}>()

const isOpen = ref(false)

const itemName = computed(
  () => ((props.item as any).to as LocationAsRelativeRaw)?.name as string
)

const isActiveLink = computed(() => {
  const routeName = route.name as string

  if (props.item.isExact) {
    return routeName === itemName.value
  }

  return routeName.startsWith(itemName.value)
})

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <NuxtLink
    v-if="!item.isExpandable"
    :to="(item as NavLink).to"
    :target="item?.isExternal ? '_blank' : ''"
    class="flex items-center space-x-3 p-3 rounded-md hover:bg-coolGray-800 cursor-pointer border border-transparent text-xs font-medium"
    :class="[isActiveLink ? 'text-blue-550' : 'text-white']"
    @click="emit('menu:close')"
  >
    <div
      :data-cy="`${dataCyTag(PortfolioCyTags.PortfolioMenuItems)}-${
        item.label
      }`"
    >
      {{ $t(item.label) }}
    </div>
  </NuxtLink>

  <template v-else>
    <div
      class="flex nav-menu items-center space-x-3 p-3 rounded-md hover:bg-coolGray-800 select-none cursor-pointer border border-transparent text-xs"
      :class="{
        'text-blue-500 bg-brand-875': (route.name as string).startsWith(
          itemName
        )
      }"
      @click="toggle"
    >
      <div class="flex-1">
        {{ $t(item.label) }}
      </div>

      <UIcon
        :name="NuxtUiIcons.ChevronLeft"
        class="transition-all h-3 w-3 min-w-3"
        :class="{
          'rotate-180': !isOpen,
          'rotate-90': isOpen
        }"
      />
    </div>

    <div v-if="isOpen" class="pl-4">
      <LayoutNavbarPortfolioMenuItem
        v-for="subItem in (item as NavChild).children"
        :key="subItem.label"
        v-bind="{ item: subItem }"
        @menu:close="emit('menu:close')"
      />
    </div>
  </template>
</template>

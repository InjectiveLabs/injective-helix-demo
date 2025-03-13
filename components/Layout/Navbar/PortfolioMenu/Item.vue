<script setup lang="ts">
import { LocationAsRelativeRaw } from 'vue-router'
import { NuxtUiIcons } from '@shared/types'
import { whitelistedAddresses } from '@/app/data/referral'
import { MenuItem, NavChild, NavLink, PortfolioCyTags } from '@/types'

const route = useRoute()
const sharedWalletStore = useSharedWalletStore()

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

const isUserWhitelisted = computed(() =>
  whitelistedAddresses.includes(sharedWalletStore.injectiveAddress)
)

const isShowItem = computed(() => {
  if (props.item.isConnectedOnly) {
    return sharedWalletStore.isUserConnected
  } else if (props.item.isReferral) {
    return isUserWhitelisted.value
  }

  return true
})

function toggle() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  emit('menu:close')
}
</script>

<template>
  <div v-if="isShowItem">
    <LayoutNavbarMenuDepositItem
      v-if="item.isOpenDepositModal"
      v-bind="{ label: item.label }"
    >
      <div
        class="flex nav-menu items-center space-x-3 p-3 rounded-md hover:bg-coolGray-800 select-none cursor-pointer border border-transparent text-xs"
        @click="closeMenu"
      >
        <div class="flex-1">
          {{ $t(item.label) }}
        </div>
      </div>
    </LayoutNavbarMenuDepositItem>

    <NuxtLink
      v-else-if="!item.isExpandable"
      :to="(item as NavLink).to"
      :target="item?.isExternal ? '_blank' : ''"
      class="flex items-center space-x-3 p-3 rounded-md hover:bg-coolGray-800 cursor-pointer border border-transparent text-xs font-medium"
      :class="[isActiveLink ? 'text-blue-550' : 'text-white']"
      @click="emit('menu:close')"
    >
      <UIcon v-if="item.icon" :name="item.icon" class="h-4 w-4 min-w-4" />

      <div
        class="flex items-center gap-2"
        :data-cy="`${dataCyTag(PortfolioCyTags.PortfolioMenuItems)}-${
          item.label
        }`"
      >
        {{ $t(item.label) }}
        <UIcon
          v-if="item?.isExternal"
          :name="NuxtUiIcons.ExternalLink"
          class="size-2.5"
        />
      </div>
    </NuxtLink>

    <template v-else>
      <div
        class="flex nav-menu items-center space-x-3 p-3 rounded-md hover:bg-coolGray-800 select-none cursor-pointer border border-transparent text-xs"
        :class="[isActiveLink ? 'text-blue-550' : 'text-white']"
        @click="toggle"
      >
        <UIcon v-if="item.icon" :name="item.icon" class="h-4 w-4 min-w-4" />

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
          @menu:close="closeMenu"
        />
      </div>
    </template>
  </div>
</template>

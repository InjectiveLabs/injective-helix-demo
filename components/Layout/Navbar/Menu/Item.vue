<script setup lang="ts">
import { LocationAsRelativeRaw } from 'vue-router'
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { TopNavMenuItem, NavBarCyTags } from '@/types'
import { MORE_MENU } from '@/app/data/menu'

const route = useRoute()

const props = withDefaults(
  defineProps<{
    item: TopNavMenuItem
  }>(),
  {}
)

const emit = defineEmits<{
  'menu:close': []
}>()

const sharedWalletStore = useSharedWalletStore()

const filteredMoreOptions = computed(() =>
  MORE_MENU.filter(({ isConnectedOnly }) =>
    isConnectedOnly ? sharedWalletStore.isUserConnected : true
  )
)

const isActiveLink = computed(() => {
  const routeName = route.name as string

  const itemName = ((props.item as any).to as LocationAsRelativeRaw)
    ?.name as string

  return routeName.startsWith(itemName)
})

const isActiveMoreLink = computed(() =>
  filteredMoreOptions.value.some((menuItem) => {
    const itemName = ((menuItem.to as LocationAsRelativeRaw)?.name ??
      '') as string

    if (!itemName) {
      return false
    }

    return (route.name as string).startsWith(itemName)
  })
)

function closeAllMenus() {
  emit('menu:close')
}
</script>

<template>
  <template v-if="props.item.isShowMore">
    <UPopover
      mode="hover"
      :popper="{ placement: 'bottom-start', offsetDistance: 0 }"
      class="relative z-50 flex items-center h-full"
    >
      <template #default="{ open }">
        <div
          tabindex="0"
          class="hover:text-blue-550 bg-brand-900 flex items-center text-xs cursor-pointer select-none h-full"
          :class="{ 'text-blue-550': open || isActiveMoreLink }"
        >
          <div
            class="py-2 px-3 flex w-full h-full"
            :data-cy="`${dataCyTag(NavBarCyTags.NavbarMenuItems)}-${
              props.item.label
            }`"
          >
            <div class="flex-1 w-full flex justify-between items-center">
              <div class="flex-1">
                <p>{{ $t(props.item.label) }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #panel>
        <div class="bg-brand-900 text-white rounded-lg w-[200px] p-2">
          <div>
            <NuxtLink
              v-for="menuItem in filteredMoreOptions"
              :key="menuItem.label"
              :class="{
                'text-blue-550': (route.name as string).startsWith(
                  ((menuItem as any).to as LocationAsRelativeRaw)
                    ?.name as string
                )
              }"
              :to="menuItem.to"
              :target="menuItem.isExternal ? '_blank' : '_self'"
              class="block px-3 py-2 hover:text-blue-550 text-xs font-medium"
              :data-cy="`${dataCyTag(NavBarCyTags.NavbarMenuItems)}-${
                menuItem.label
              }`"
              @click="closeAllMenus"
            >
              <div class="flex items-center gap-2">
                <span>{{ $t(menuItem.label) }}</span>
                <UIcon
                  v-if="menuItem.isExternal"
                  :name="NuxtUiIcons.ExternalLink"
                  class="opacity-75 h-2 w-2 min-w-2"
                />
              </div>
            </NuxtLink>
          </div>
        </div>
      </template>
    </UPopover>
  </template>

  <template v-else>
    <NuxtLink
      class="hover:text-blue-550 flex items-center py-2 px-3 text-xs cursor-pointer select-none rounded-lg"
      :to="props.item.to"
      :class="{ 'text-blue-550': isActiveLink }"
      :target="props.item.isExternal ? '_blank' : '_self'"
      :data-cy="`${dataCyTag(NavBarCyTags.NavbarMenuItems)}-${
        props.item.label
      }`"
      @click="closeAllMenus"
    >
      <div class="flex items-center">
        <div class="flex flex-col justify-start">
          <div class="flex items-center space-x-1.5">
            <p class="font-medium">{{ $t(props.item.label) }}</p>
          </div>
        </div>
      </div>
    </NuxtLink>
  </template>
</template>

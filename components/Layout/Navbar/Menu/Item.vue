<script setup lang="ts">
import { LocationAsRelativeRaw } from 'vue-router'
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { NavBarCyTags, MenuItem, NavLink, NavChild } from '@/types'

const route = useRoute()
const sharedWalletStore = useSharedWalletStore()

const props = withDefaults(
  defineProps<{
    item: MenuItem
  }>(),
  {}
)

const emit = defineEmits<{
  'menu:close': []
}>()

const isShowItem = computed(() => {
  if (props.item.isConnectedOnly) {
    return sharedWalletStore.isUserConnected
  }

  return true
})

const isActiveLink = computed(() => {
  const routeName = route.name as string

  const itemName = ((props.item as any).to as LocationAsRelativeRaw)
    ?.name as string

  if (props.item.isExact) {
    return routeName === itemName
  }

  return routeName.startsWith(itemName)
})

function closeAllMenus() {
  emit('menu:close')
}
</script>

<template>
  <div v-if="isShowItem">
    <NuxtLink
      v-if="!item.isExpandable"
      :to="(item as NavLink).to"
      class="px-3 py-1.5 hover:text-blue-550 flex items-center text-xs cursor-pointer select-none text-white"
      :class="{
        'text-blue-550': isActiveLink
      }"
      :target="item.isExternal ? '_blank' : '_self'"
      :data-cy="`${dataCyTag(NavBarCyTags.NavbarMenuItems)}-${item.label}`"
      @click="closeAllMenus"
    >
      <p class="font-medium">{{ $t(item.label) }}</p>
    </NuxtLink>

    <UPopover
      v-else
      mode="hover"
      :popper="{ placement: 'bottom-start', offsetDistance: 0 }"
      class="relative z-50 flex items-center h-full"
    >
      <template #default="{ open }">
        <div tabindex="0" :class="{ 'text-blue-550': open }">
          <div
            class="flex w-full h-full items-center space-x-1"
            :data-cy="`${dataCyTag(NavBarCyTags.NavbarMenuItems)}-${
              item.label
            }`"
          >
            <div class="flex-1 w-full flex justify-between items-center">
              <div class="flex-1">
                <p>{{ $t(item.label) }}</p>
              </div>
            </div>

            <UIcon
              :name="NuxtUiIcons.ChevronLeft"
              class="transition-all h-3 w-3 min-w-3 -rotate-90"
            />
          </div>
        </div>
      </template>

      <template #panel>
        <div class="bg-coolGray-875 text-white rounded-lg w-[200px] p-3">
          <ul class="space-y-1.5">
            <li
              v-for="child in (item as NavChild).children.filter((child) =>
                child.isConnectedOnly ? sharedWalletStore.isUserConnected : true
              )"
              :key="child.label"
              class="relative cursor-pointer"
            >
              <template v-if="!child.isExpandable">
                <LayoutNavbarMenuDepositItem
                  v-if="child.isOpenDepositModal"
                  v-bind="{ label: child.label }"
                />

                <NuxtLink
                  v-else
                  :to="(child as NavLink).to"
                  :target="child.isExternal ? '_blank' : '_self'"
                  :data-cy="`${dataCyTag(NavBarCyTags.NavbarMenuItems)}-${
                    child.label
                  }`"
                  @click="closeAllMenus"
                >
                  <div
                    class="group/item block text-xs text-white hover:text-blue-550 font-semibold w-full rounded p-1"
                  >
                    <div class="flex items-center gap-2">
                      {{ $t(child.label) }}
                      <UIcon
                        v-if="child.isExternal"
                        :name="NuxtUiIcons.ExternalLink"
                        class="size-2.5"
                      />
                    </div>
                  </div>
                </NuxtLink>
              </template>

              <template v-else-if="(child as NavChild).children">
                <UDropdown
                  mode="hover"
                  :items="
                    [(child as NavChild).children].map((grandchild) =>
                      grandchild.map((subItem) => ({
                        ...subItem,
                        ...(subItem.isExternal && { target: '_blank' })
                      }))
                    )
                  "
                  :ui="{
                    width: 'w-[275px]',
                    padding: 'p-1'
                  }"
                  class="w-full cursor-pointer"
                  :popper="{ placement: 'right-start', offsetDistance: 40 }"
                >
                  <template #default>
                    <div class="flex justify-between w-full group/child">
                      <div>
                        <div
                          class="text-2xs text-white group-hover/child:text-blue-550"
                        >
                          {{ $t(child.label) }}
                        </div>
                      </div>

                      <UIcon
                        :name="NuxtUiIcons.ChevronLeft"
                        class="transition-all h-3 w-2.5 min-w-2.5 rotate-180 group-hover/child:text-blue-550"
                      />
                    </div>
                  </template>

                  <template #item="{ item: grandchild }">
                    <div class="flex justify-between w-full group/grandchild">
                      <div>
                        <div
                          class="inline-block text-2xs text-left group-hover/grandchild:text-blue-550 mb-0.5"
                        >
                          {{ $t(grandchild.label) }}
                        </div>
                      </div>
                    </div>
                  </template>
                </UDropdown>
              </template>
            </li>
          </ul>
        </div>
      </template>
    </UPopover>
  </div>
</template>

<script setup lang="ts">
import { LocationAsRelativeRaw } from 'vue-router'
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { NavBarCyTags, MenuItem, NavLink, NavChild } from '@/types'

const route = useRoute()

const props = defineProps<{
  item: MenuItem
}>()

const emit = defineEmits<{
  'menu:close': []
}>()

function closeAllMenus() {
  emit('menu:close')
}

const isActiveLink = computed(() => {
  const routeName = route.name as string

  const itemName = ((props.item as any).to as LocationAsRelativeRaw)
    ?.name as string

  if (props.item.isExact) {
    return routeName === itemName
  }

  return routeName.startsWith(itemName)
})
</script>

<template>
  <div
    class="px-3 py-1.5 hover:text-blue-550 flex items-center text-xs cursor-pointer select-none text-white"
  >
    <NuxtLink
      v-if="!item.isExpandable"
      :to="(item as NavLink).to"
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
              v-for="child in (item as NavChild).children"
              :key="child.label"
              class="relative"
            >
              <template v-if="!child.isExpandable">
                <NuxtLink
                  :to="(child as NavLink).to"
                  :target="child.isExternal ? '_blank' : '_self'"
                  :data-cy="`${dataCyTag(NavBarCyTags.NavbarMenuItems)}-${
                    child.label
                  }`"
                  @click="closeAllMenus"
                >
                  <div
                    class="group/item block text-2xs text-white hover:text-blue-550 font-semibold w-full hover:bg-[#0F172A] rounded p-1"
                  >
                    <div
                      class="inline-block"
                      :class="{
                        'border-b border-b-white group-hover/item:border-b-blue-550':
                          child.isExternal
                      }"
                    >
                      {{ $t(child.label) }}
                    </div>

                    <div
                      v-if="child.description"
                      class="text-[6.78px] tracking-[0.339px] text-coolGray-475 mt-[1.36px] group-hover/item:text-blue-550"
                    >
                      {{ $t(child.description) }}
                    </div>
                  </div>
                </NuxtLink>
              </template>

              <template v-else>
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
                  class="w-full"
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
                        <div
                          v-if="child.description"
                          class="text-[6.78px] tracking-[0.339px] text-coolGray-475 mt-[1.36px] group-hover/child:text-blue-550"
                        >
                          {{ $t(child.description) }}
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
                          :class="{
                            'border-b border-b-white group-hover/grandchild:border-b-blue-550':
                              grandchild.isExternal
                          }"
                        >
                          {{ $t(grandchild.label) }}
                        </div>
                        <div
                          v-if="grandchild.description"
                          class="text-[6.78px] tracking-[0.339px] text-coolGray-475 mt-[1.36px] group-hover/grandchild:text-blue-550"
                        >
                          {{ $t(grandchild.description) }}
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

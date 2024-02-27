<script setup lang="ts">
import { MenuItem, MenuItemType } from '~/types'

defineProps({
  item: {
    type: Object as PropType<MenuItem>,
    required: true
  },

  level: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits<{
  'menu:close': []
}>()

const isOpen = ref(false)

function closeAllMenus() {
  isOpen.value = false
  emit('menu:close')
}
</script>

<template>
  <NuxtLink
    v-if="item.type === MenuItemType.Link"
    class="hover:bg-gray-800 flex items-center py-2 px-6 font-semibold text-sm hover:cursor-pointer select-none"
    :class="{
      'rounded-lg': level === 0,
      'w-[300px]': level > 0
    }"
    :to="item.to"
    @click="closeAllMenus"
  >
    <div>
      <p class="font-semibold" :class="{ 'text-lg': level > 0 }">
        {{ $t(`navigation.${item.label}`) }}
      </p>
      <p v-if="item.description" class="text-gray-400 text-xs mt-1 font-normal">
        {{ $t(`navigation.${item.description}`) }}
      </p>
    </div>
  </NuxtLink>

  <div
    v-else
    class="hover:bg-gray-800 bg-brand-900 flex items-center font-semibold text-sm hover:cursor-pointer select-none relative z-50"
    :class="{
      'rounded-lg': level === 0
    }"
    @mouseenter="isOpen = true"
    @mouseleave="isOpen = false"
  >
    <div class="py-2 px-6 flex">
      <div>
        <p class="font-semibold" :class="{ 'text-lg': level > 0 }">
          {{ $t(`navigation.${item.label}`) }}
        </p>
        <p
          v-if="item.description"
          class="text-gray-400 text-xs mt-1 font-normal"
        >
          {{ $t(`navigation.${item.description}`) }}
        </p>
      </div>

      <div v-if="level > 0" class="flex items-center">
        <BaseIcon name="chevron" class="rotate-180" is-sm />
      </div>
    </div>

    <Transition name="slide-in-top" mode="out-in">
      <div
        v-if="isOpen"
        class="absolute"
        :class="{
          'top-full left-0': level === 0,
          'top-0 left-full': level > 0
        }"
      >
        <div
          :class="{
            'pt-2': level === 0,
            'pl-1': level > 0
          }"
        >
          <div
            class="bg-brand-900 border-brand-800 border text-white rounded-lg"
          >
            <LayoutNavbarMenuItem
              v-for="subItem in item.items"
              :key="subItem.label"
              v-bind="{ item: subItem, level: level + 1 }"
              @menu:close="closeAllMenus"
            />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

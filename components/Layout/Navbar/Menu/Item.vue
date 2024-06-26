<script setup lang="ts">
import { MenuItem, MenuItemType } from '@/types'

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
const isAnimating = ref(false)

function closeAllMenus() {
  isOpen.value = false

  emit('menu:close')
}

function open() {
  if (isAnimating.value) {
    return
  }

  isOpen.value = true
}

function close() {
  isOpen.value = false
}
</script>

<template>
  <NuxtLink
    v-if="item.type === MenuItemType.Link"
    class="hover:bg-gray-800 flex items-center py-2 px-6 font-semibold text-sm cursor-pointer select-none"
    :class="{
      'rounded-lg': level === 0,
      'w-[325px]': level > 0
    }"
    :to="item.to"
    :target="item?.isExternal ? '_blank' : ''"
    @click="closeAllMenus"
  >
    <div>
      <div class="flex items-center justify-center">
        <SharedIcon v-if="item.icon" class="mr-3" :name="item.icon" />

        <div class="flex flex-col justify-start">
          <div class="flex items-center justify-start space-x-1.5">
            <p :class="{ 'font-medium': level > 0 }">
              {{ $t(item.label) }}
            </p>
            <SharedIcon
              v-if="item.isExternal"
              name="external-link"
              is-sm
              class="opacity-75"
            />
          </div>

          <p
            v-if="item.description"
            class="text-gray-500 text-xs mt-1 font-normal"
          >
            {{ $t(item.description) }}
          </p>
        </div>
      </div>
    </div>
  </NuxtLink>

  <div
    v-else
    tabindex="0"
    class="hover:bg-gray-800 bg-brand-900 flex items-center font-semibold text-sm cursor-pointer select-none relative z-50"
    :class="{
      'rounded-lg': level === 0
    }"
    @mouseenter="open"
    @mouseleave="close"
  >
    <div class="py-2 px-6 flex">
      <div>
        <p class="font-medium" :class="{ 'font-medium text-lg': level > 0 }">
          {{ $t(item.label) }}
        </p>
        <p
          v-if="item.description"
          class="text-gray-400 text-xs mt-1 font-normal"
        >
          {{ $t(item.description) }}
        </p>
      </div>

      <div v-if="level > 0" class="flex items-center">
        <SharedIcon name="chevron" class="rotate-180" is-sm />
      </div>
    </div>

    <Transition
      enter-active-class="transition-all duration-300 "
      leave-active-class="transition-all duration-300"
      enter-from-class="opacity-0 scale-95 origin-top"
      :leave-to-class="`opacity-0 origin-top ${level === 0 ? 'scale-90' : ''}`"
      mode="out-in"
      @before-leave="isAnimating = true"
      @after-leave="isAnimating = false"
    >
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

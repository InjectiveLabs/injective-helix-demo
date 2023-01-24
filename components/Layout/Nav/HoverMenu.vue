<script lang="ts" setup>
import { Menu } from 'floating-vue'

defineProps({
  shown: Boolean
})

const emit = defineEmits<{
  (e: 'dropdown:toggle', state: boolean): void
}>()

function show() {
  emit('dropdown:toggle', true)
}

function hide() {
  emit('dropdown:toggle', false)
}

function updateShown(value: boolean) {
  emit('dropdown:toggle', value)
}
</script>

<template>
  <Menu
    v-bind="$attrs"
    placement="top"
    popper-class="v-popper__navigation"
    :delay="200"
    :distance="8"
    :shown="shown"
    :triggers="['click', 'hover', 'focus']"
    @update:shown="updateShown"
  >
    <div @mouseenter="show" @mouseleave="hide">
      <slot />
    </div>

    <template #popper>
      <slot name="content" />
    </template>
  </Menu>
</template>

<style>
.v-popper__navigation {
  @apply w-80 xs:w-96 rounded-lg bg-gray-850 shadow-dropdown z-50 flex flex-col flex-wrap;
  transition: opacity 250ms ease-in-out !important;
}
.v-popper__navigation.v-popper__popper--show-from,
.v-popper__navigation.v-popper__popper--show-to,
.v-popper__navigation.v-popper__popper--hide-from,
.v-popper__navigation.v-popper__popper--hide-to {
  @apply visible;
}
</style>

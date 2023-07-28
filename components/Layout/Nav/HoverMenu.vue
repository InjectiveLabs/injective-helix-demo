<template>
  <BaseHoverMenu
    placement="top"
    popper-class="v-popper__navigation"
    :delay="200"
  >
    <slot />

    <template #content>
      <slot name="content" />
    </template>
  </BaseHoverMenu>
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

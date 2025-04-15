<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'

withDefaults(
  defineProps<{
    value: string
    sortBy: string
    isAscending?: boolean
  }>(),
  {
    isAscending: false
  }
)
</script>

<template>
  <SharedSortableHeaderItem
    :is-ascending="isAscending"
    :sort-by="sortBy"
    :value="value"
    v-bind="$attrs"
  >
    <template #default="{ isActive }">
      <div
        class="flex cursor-pointer items-center gap-1 text-white"
        :class="$attrs.class"
      >
        <div class="flex flex-col">
          <UIcon
            :name="NuxtUiIcons.TriangleUp"
            class="transition-all rotate-180 -mb-0.5"
            :class="[
              isActive && isAscending
                ? 'text-coolGray-200'
                : 'text-coolGray-600'
            ]"
          />
          <UIcon
            :name="NuxtUiIcons.TriangleDown"
            class="-mt-0.5"
            :class="[
              isActive && !isAscending
                ? 'text-coolGray-200'
                : 'text-coolGray-600'
            ]"
          />
        </div>

        <slot />
      </div>
    </template>
  </SharedSortableHeaderItem>
</template>

<script lang="ts" setup>
defineProps({
  ascending: Boolean,

  value: {
    type: String,
    required: true
  },

  sortBy: {
    type: String,
    required: true
  }
})
</script>

<template>
  <BaseSortableHeaderItem
    :ascending="ascending"
    :sort-by="sortBy"
    :value="value"
    v-bind="$attrs"
  >
    <template #default="{ isActive }">
      <div class="flex cursor-pointer items-center gap-1" :class="$attrs.class">
        <div class="space-y-1">
          <BaseIcon
            name="triangle"
            is-xs
            class="transition-all rotate-180"
            :class="[isActive && ascending ? 'text-gray-200' : 'text-gray-600']"
          />
          <BaseIcon
            name="triangle"
            :class="[
              isActive && !ascending ? 'text-gray-200' : 'text-gray-600'
            ]"
            is-xs
          />
        </div>

        <slot />
      </div>
    </template>
  </BaseSortableHeaderItem>
</template>

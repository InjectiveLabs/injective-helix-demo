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
    <template #default="{ active }">
      <div class="flex cursor-pointer items-center gap-1" :class="$attrs.class">
        <slot />
        <div class="space-y-1">
          <BaseIcon
            name="triangle"
            xs
            class="transition-all rotate-180"
            :class="[active && ascending ? 'text-gray-200' : 'text-gray-600']"
          />
          <BaseIcon
            name="triangle"
            :class="[active && !ascending ? 'text-gray-200' : 'text-gray-600']"
            xs
          />
        </div>
      </div>
    </template>
  </BaseSortableHeaderItem>
</template>

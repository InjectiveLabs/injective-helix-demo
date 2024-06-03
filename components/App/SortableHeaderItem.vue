<script lang="ts" setup>
defineProps({
  isAscending: Boolean,

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
    :is-ascending="isAscending"
    :sort-by="sortBy"
    :value="value"
    v-bind="$attrs"
  >
    <template #default="{ isActive }">
      <div class="flex cursor-pointer items-center gap-1" :class="$attrs.class">
        <div>
          <SharedIcon
            name="triangle"
            is-xs
            class="transition-all rotate-180"
            :class="[
              isActive && isAscending ? 'text-gray-200' : 'text-gray-600'
            ]"
          />
          <SharedIcon
            name="triangle"
            :class="[
              isActive && !isAscending ? 'text-gray-200' : 'text-gray-600'
            ]"
            is-xs
          />
        </div>

        <slot />
      </div>
    </template>
  </BaseSortableHeaderItem>
</template>

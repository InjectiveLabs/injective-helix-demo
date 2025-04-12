<script setup lang="ts">
withDefaults(
  defineProps<{
    sortOptions: { label: string; value: string }[]
  }>(),
  {
    sortOptions: () => []
  }
)

const sortBy = defineModel<string>('sortBy')
const sortDirection = defineModel<string>('sortDirection')
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
    <div>
      <p class="text-xs text-gray-500 mb-2">{{ $t('common.sortBy') }}</p>
      <USelectMenu
        v-model="sortBy"
        value-attribute="value"
        :options="sortOptions"
      />
    </div>

    <div>
      <p class="text-xs text-gray-500 mb-2">{{ $t('common.sortDirection') }}</p>
      <USelectMenu
        v-model="sortDirection"
        :options="[
          {
            label: $t('common.ascending'),
            value: 'asc'
          },
          {
            label: $t('common.descending'),
            value: 'desc'
          }
        ]"
        value-attribute="value"
      />
    </div>
  </div>
</template>

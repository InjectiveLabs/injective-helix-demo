<script setup lang="ts">
withDefaults(
  defineProps({
    isActive: Boolean
  }),
  {}
)
</script>

<template>
  <thead>
    <tr class="text-left text-xs text-gray-400 uppercase">
      <th>
        {{ $t('campaign.market') }}
      </th>
      <th>
        {{ $t('campaign.volume') }}
      </th>
      <th>
        {{ $t(`campaign.${isActive ? 'estRewards' : 'rewards'}`) }}
      </th>
    </tr>
  </thead>
</template>

<style scoped>
th {
  @apply font-normal px-2 py-4;
}
</style>

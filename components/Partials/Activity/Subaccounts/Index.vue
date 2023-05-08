<script setup lang="ts">
const route = useRoute()

const showSelector = computed(
  () => !route.name?.toString().startsWith('activity-wallet-history')
)
</script>

<template>
  <div class="flex items-center py-4">
    <h1 class="text-3xl font-semibold mr-4 my-2">
      {{ $t('activity.activity') }}
    </h1>
    <PartialsActivitySubaccountsSelector v-if="showSelector" />
  </div>
</template>

<script lang="ts" setup>
const appStore = useAppStore()
</script>

<template>
  <div class="flex items-center py-4">
    <h1 class="text-3xl font-semibold mr-4 my-2">
      {{ $t('activity.activity') }}
    </h1>

    <PartialsActivitySubaccountsSelector
      v-if="appStore.isSubaccountManagementActive"
    />
  </div>
</template>

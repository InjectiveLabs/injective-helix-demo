<script setup lang="ts">
//
</script>

<template>
  <div class="h-header flex">
    <CommonSubaccountTabSelector />

    <div class="flex divide-x border-r flex-1">
      <div class="flex items-center">
        <p class="text-sm text-gray-300 px-4">Total: $10,208.25</p>
      </div>

      <label class="flex px-4 flex-1">
        <div class="flex items-center">
          <BaseIcon name="search" class="text-gray-500" />
        </div>
        <input
          class="p-2 bg-transparent focus:outline-none flex-1"
          placeholder="Filter by asset"
        />
      </label>

      <div class="flex items-center px-4">
        <AppCheckbox> Show Margin Currency Only </AppCheckbox>
      </div>

      <div class="flex items-center px-4">
        <AppCheckbox> Hide Small Balances </AppCheckbox>
      </div>
    </div>
  </div>
</template>

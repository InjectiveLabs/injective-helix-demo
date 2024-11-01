<script setup lang="ts">
//
</script>

<template>
  <UCard
    :ui="{
      background: 'dark:bg-brand-850',
      ring: 'dark:hover:ring-primary-500',
      body: {
        padding: 'px-2 sm:px-4 py-2 sm:py-4'
      }
    }"
  >
    <div class="flex">
      <UAvatar alt="Bot Avatar" size="xl" />
      <div class="flex flex-col items-start flex-1 pl-2">
        <p class="text-xl font-bold">TIA-USDT</p>
        <p
          class="text-gray-300 bg-gray-600 p-1 font-semibold rounded-md text-xs"
        >
          Spot Grid
        </p>
      </div>
      <div class="text-sm">
        <p class="text-gray-300">2 days</p>
      </div>
    </div>

    <div class="flex justify-between mt-8">
      <div class="text-left">
        <p class="text-gray-500 mb-1 text-xs">Assets In Bot</p>
        <p class="text-xl font-bold">$300,232.32</p>
      </div>

      <div class="text-right">
        <p class="text-gray-500 mb-1 text-xs">ROI</p>
        <p class="text-xl font-bold">
          <span class="text-green-500">+123.43%</span>
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const { pnl, pnltoString, durationFormatted, market } = useActiveGridStrategy()
</script>

<template>
  <div class="grid grid-cols-3 border-b border-gray-700 pb-4">
    <div>
      <p class="text-gray-500 text-sm">Status</p>
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 rounded-full bg-green-500" />
        <span>Running</span>
      </div>
    </div>

    <div class="text-center">
      <p class="text-gray-500 text-sm">Total Profit</p>
      <p :class="[pnl.isPositive() ? 'text-green-500' : 'text-red-500']">
        {{ pnltoString }} {{ market?.quoteToken.symbol }}
      </p>
    </div>

    <div class="text-right">
      <p class="text-gray-500 text-sm">Duration</p>
      <p>{{ durationFormatted }}</p>
    </div>
  </div>
</template>

<template>
  <div class="overflow-x-auto h-full grid grid-rows-[auto_1fr]">
    <div class="grid grid-cols-5">
      <div class="font-normal text-xs p-4">Time</div>

      <div class="font-normal text-xs p-4">Market</div>

      <div class="font-normal text-xs p-4">Investment</div>

      <div class="font-normal text-xs p-4">Duration</div>

      <div class="font-normal text-xs p-4">Grid Status</div>
    </div>
    <div class="bg-black rounded-xl">
      <PartialsGridTradingSpotOrdersRow v-bind="{ strategy: {} }" />
    </div>
  </div>
</template>

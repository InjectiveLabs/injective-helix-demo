<script setup lang="ts">
//
</script>

<template>
  <div class="border-b pb-4 mb-6">
    <div class="text-xs space-y-2 pt-4 pb-2">
      <p class="text-gray-300">{{ $t('sgt.autoModeHeader') }}</p>
      <div>
        <a class="text-blue-500" href="#">{{ $t('sgt.learnMore') }}</a>
      </div>
    </div>

    <div class="text-xs text-gray-500 space-y-4 py-4">
      <div class="flex justify-between">
        <p>{{ $t('sgt.lowerPrice') }}</p>
        <p class="text-white">14232.32 USDT</p>
      </div>

      <div class="flex justify-between">
        <p>{{ $t('sgt.upperPrice') }}</p>
        <p class="text-white">14232.32 USDT</p>
      </div>

      <div class="flex justify-between">
        <p>{{ $t('sgt.gridNumber') }}</p>
        <p class="text-white">23</p>
      </div>

      <div class="flex justify-between">
        <p>{{ $t('sgt.profitGrid') }}</p>
        <p class="text-white">0.3%</p>
      </div>
    </div>

    <button class="text-blue-500">
      {{ $t('sgt.copyParametersToManual') }}
    </button>
  </div>
</template>

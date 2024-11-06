<script setup lang="ts">
//
</script>

<template>
  <div>
    <UAccordion
      variant="ghost"
      color="gray"
      default-open
      :items="[
        {
          label: 'Details',
          slot: 'details'
        }
      ]"
    >
      <template #details>
        <div class="text-white space-y-2">
          <div class="flex justify-between items-center">
            <p class="text-xs text-coolGray-500">
              {{ $t('sgt.numberOfGrids') }}
            </p>
            <p class="font-semibold">10</p>
          </div>

          <div class="flex justify-between items-center">
            <p class="text-xs text-coolGray-500">
              {{ $t('sgt.lowerPrice') }}
            </p>
            <p class="font-semibold">10</p>
          </div>

          <div class="flex justify-between items-center">
            <p class="text-xs text-coolGray-500">
              {{ $t('sgt.upperPrice') }}
            </p>
            <p class="font-semibold">10</p>
          </div>

          <div class="flex justify-between items-center">
            <p class="text-xs text-coolGray-500">
              {{ $t('liquidityBots.trailingBoundaries') }}
            </p>
            <p class="font-semibold">10</p>
          </div>

          <div class="flex justify-between items-center">
            <p class="text-xs text-coolGray-500">
              {{ $t('liquidityBots.currentPrice') }}
            </p>
            <p class="font-semibold">10</p>
          </div>

          <div class="flex justify-between items-center">
            <p class="text-xs text-coolGray-500">
              {{ $t('liquidityBots.stopLoss') }}
            </p>
            <p class="font-semibold">10</p>
          </div>

          <div class="flex justify-between items-center">
            <p class="text-xs text-coolGray-500">
              {{ $t('liquidityBots.takeProfit') }}
            </p>
            <p class="font-semibold">10</p>
          </div>
        </div>
      </template>
    </UAccordion>
  </div>
</template>

<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'

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

      <div>
        <div class="text-sm flex items-center gap-1">
          <UIcon class="size-6" :name="NuxtUiIcons.User" />
          <div class="text-gray-300 leading-none">123</div>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <p class="text-gray-500 mb-1 text-xs">{{ $t('tradingBots.totalRoi') }}</p>
      <p class="text-green-500 text-2xl font-semibold">+123.43%</p>
    </div>

    <div class="flex justify-between mt-4">
      <div class="text-left">
        <p class="text-gray-500 mb-1 text-xs">{{ $t('common.runtime') }}</p>
        <p class="text-sm">40d 2h</p>
      </div>

      <div class="text-right">
        <p class="text-gray-500 mb-1 text-xs">
          {{ $t('tradingBots.priceRange') }}
        </p>
        <p class="text-sm">8.45-10.32 USDT</p>
      </div>
    </div>

    <template #footer>
      <UButton block>
        {{ $t('common.create') }}
      </UButton>
    </template>
  </UCard>
</template>

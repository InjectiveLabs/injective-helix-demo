<script setup lang="ts">
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
</script>

<template>
  <CommonHeadlessTotalBalance>
    <template #default="{ stakedAmount, stakedAmountInUsd }">
      <div class="p-2 grid grid-cols-8 text-xs text-gray-400 border-t">
        <div class="p-2 col-start-3 text-right">
          <span>{{ $t('trade.staked') }}:</span>
          <span class="text-white font-mono ml-1">
            {{ stakedAmount.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS) }}
          </span>
        </div>

        <div class="p-2 col-start-6 text-right">
          <span class="text-white font-mono ml-1">
            $ {{ stakedAmountInUsd.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS) }}
          </span>
        </div>
      </div>
    </template>
  </CommonHeadlessTotalBalance>
</template>

<script setup lang="ts">
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
</script>

<template>
  <CommonHeadlessTotalBalance :decimal-places="UI_DEFAULT_MIN_DISPLAY_DECIMALS">
    <template #default="{ stakedAmountToFixed, stakedAmountInUsdToFixed }">
      <div class="p-2 grid grid-cols-8 text-xs text-coolGray-400 border-t">
        <div class="p-2 col-start-3 text-right">
          <span>{{ $t('trade.staked') }}:</span>
          <span class="text-white font-mono ml-1">
            <AppAmount
              v-bind="{
                amount: stakedAmountToFixed
              }"
            />
          </span>
        </div>

        <div class="p-2 col-start-6 text-right">
          <span class="mr-1">$</span>
          <AppUsdAmount
            v-bind="{
              amount: stakedAmountInUsdToFixed
            }"
          />
        </div>
      </div>
    </template>
  </CommonHeadlessTotalBalance>
</template>

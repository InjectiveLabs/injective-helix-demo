<script setup lang="ts">
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { AccountBalance } from '@/types'

const props = withDefaults(defineProps<{ balance: AccountBalance }>(), {})

const totalAmount = computed(() =>
  sharedToBalanceInToken({
    value: props.balance.totalBalance,
    decimalPlaces: props.balance.token.decimals
  })
)
</script>
<template>
  <div class="flex justify-between pr-2">
    <div class="flex py-2">
      <div class="flex items-center mr-2">
        <CommonTokenIcon v-bind="{ token: balance.token }" />
      </div>
      <div class="text-xs flex items-center">
        <div>
          <p class="text-sm font-semibold">{{ balance.token.symbol }}</p>
          <p class="text-coolGray-400">
            <AppAmount
              v-bind="{
                amount: totalAmount,
                decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
            />
          </p>
        </div>
      </div>
    </div>
    <div class="flex items-center">
      <span class="text-sm flex">
        <span>$</span>
        <AppUsdAmount
          v-bind="{
            decimalPlaces: 18,
            amount: balance.totalBalanceInUsd
          }"
        />
      </span>
    </div>
  </div>
</template>

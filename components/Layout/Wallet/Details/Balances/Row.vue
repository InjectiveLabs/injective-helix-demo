<script setup lang="ts">
import { TokenVerification } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import type { AccountBalance } from '@/types'

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
            <SharedAmount
              v-bind="{
                amount: totalAmount,
                decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
            />
          </p>
        </div>
      </div>

      <SharedIcon
        v-if="balance.token.tokenVerification === TokenVerification.Verified"
        name="check-shield"
        is-md
        class="text-green-500 ml-2"
      />
    </div>
    <div class="flex items-center">
      <span class="text-sm flex">
        <SharedAmountUsd
          v-bind="{
            amount: balance.totalBalanceInUsd
          }"
        >
          <template #prefix>$</template>
        </SharedAmountUsd>
      </span>
    </div>
  </div>
</template>

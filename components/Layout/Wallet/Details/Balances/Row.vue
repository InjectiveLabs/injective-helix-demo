<script setup lang="ts">
import { BigNumberInWei } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { AccountBalance } from '@/types'

const props = withDefaults(defineProps<{ balance: AccountBalance }>(), {})

const { valueToFixed: totalAmountToFixed } = useSharedBigNumberFormatter(
  computed(() => {
    return new BigNumberInWei(props.balance.accountTotalBalance).toBase(
      props.balance.token.decimals
    )
  }),
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToFixed: totalAmountInUsdToFixed } = useSharedBigNumberFormatter(
  computed(() => {
    return new BigNumberInWei(props.balance.accountTotalBalanceInUsd).toBase(
      props.balance.token.decimals
    )
  }),
  { decimalPlaces: 18 }
)
</script>

<template>
  <div class="flex justify-between">
    <div class="flex py-2">
      <div class="flex items-center mr-2">
        <CommonTokenIcon v-bind="{ token: balance.token }" />
      </div>
      <div class="text-xs flex items-center">
        <div>
          <p class="text-sm font-semibold">{{ balance.token.symbol }}</p>
          <p class="text-coolGray-400">
            <AppAmount v-bind="{ amount: totalAmountToFixed }" />
          </p>
        </div>
      </div>
    </div>

    <div class="flex items-center">
      <span class="text-sm flex">
        <span>$</span>
        <AppUsdAmount v-bind="{ amount: totalAmountInUsdToFixed }" />
      </span>
    </div>
  </div>
</template>

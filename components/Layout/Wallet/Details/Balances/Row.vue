<script setup lang="ts">
import { BigNumberInWei } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { AccountBalance } from '@/types'

const props = defineProps({
  balance: {
    type: Object as PropType<AccountBalance>,
    required: true
  }
})

const { valueToString: totalAmountToString } = useSharedBigNumberFormatter(
  computed(() => {
    return new BigNumberInWei(props.balance.accountTotalBalance).toBase(
      props.balance.token.decimals
    )
  }),
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToString: totalAmountInUsdToString } = useSharedBigNumberFormatter(
  computed(() => {
    return new BigNumberInWei(props.balance.accountTotalBalanceInUsd).toBase(
      props.balance.token.decimals
    )
  }),
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
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
          <p class="text-gray-400">{{ totalAmountToString }}</p>
        </div>
      </div>
    </div>

    <div class="flex items-center">
      <span class="text-sm"> ${{ totalAmountInUsdToString }}</span>
    </div>
  </div>
</template>

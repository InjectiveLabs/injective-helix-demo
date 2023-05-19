<script setup lang="ts">
import { cosmosSdkDecToBigNumber } from '@injectivelabs/sdk-ts'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'

const exchangeStore = useExchangeStore()

const stakedAmount = computed(() => {
  if (
    !exchangeStore.feeDiscountAccountInfo ||
    !exchangeStore.feeDiscountAccountInfo.accountInfo
  ) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(
    cosmosSdkDecToBigNumber(
      exchangeStore.feeDiscountAccountInfo.accountInfo.stakedAmount
    )
  )
})

const { valueToString: stakedAmountToFormat } = useBigNumberFormatter(
  stakedAmount,
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)
</script>

<template>
  <tr
    class="border-b border-gray-700 hover:bg-gray-700 bg-transparent px-4 py-0 overflow-hidden h-14 gap-2 transition-all max-h-20"
    :data-cy="'wallet-balance-table-row-inj-staked'"
  >
    <td class="pl-4 w-56">
      <slot name="tokenSymbol">
        <span> &mdash; </span>
      </slot>
    </td>

    <td>
      <div class="flex justify-end">
        <span> &mdash; </span>
      </div>
    </td>

    <td>
      <div class="flex justify-end">
        <div class="text-right">
          <p class="text-gray-350 text-xs normal-case font-bold">
            {{ $t('account.staked') }}:
          </p>
          <span class="font-mono text-sm"> {{ stakedAmountToFormat }} </span>
        </div>
      </div>
    </td>

    <td>
      <div class="flex justify-end">
        <span> &mdash; </span>
      </div>
    </td>

    <td>
      <div class="flex justify-end" data-cy="wallet-balance-wallet-table-data">
        <span> &mdash; </span>
      </div>
    </td>

    <td>
      <div class="flex justify-end">
        <span> &mdash; </span>
      </div>
    </td>

    <td class="pr-4">
      <div class="flex items-center justify-end gap-4 col-start-2 col-span-2">
        <slot name="action">
          <div
            class="rounded flex items-center justify-center w-auto h-auto cursor-pointer"
          >
            <NuxtLink
              :to="{ name: 'fee-discounts' }"
              class="text-blue-500 text-sm font-medium"
            >
              {{ 'View Fee Discounts' }}
            </NuxtLink>
          </div>
        </slot>
      </div>
    </td>
  </tr>
</template>

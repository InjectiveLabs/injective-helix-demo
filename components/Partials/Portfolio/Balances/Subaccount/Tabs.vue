<script setup lang="ts">
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInWei } from '@injectivelabs/utils'

const props = defineProps({
  search: {
    type: String,
    default: ''
  },

  showMarginCurrencyOnly: {
    type: Boolean,
    default: false
  },

  hideSmallBalances: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<{
  'update:search': [value: string]
  'update:showMarginCurrencyOnly': [value: boolean]
  'update:hideSmallBalances': [value: boolean]
}>()

const accountStore = useAccountStore()
const { aggregatedPortfolioBalances } = useBalance()

const search = computed({
  get: () => props.search,
  set: (value: string) => emit('update:search', value)
})

const showMarginCurrencyOnly = computed({
  get: () => props.showMarginCurrencyOnly,
  set: (value: boolean) => emit('update:showMarginCurrencyOnly', value)
})

const hideSmallBalances = computed({
  get: () => props.hideSmallBalances,
  set: (value: boolean) => emit('update:hideSmallBalances', value)
})

const { valueToString: accountTotalBalanceInUsdToString } =
  useSharedBigNumberFormatter(
    computed(
      () =>
        aggregatedPortfolioBalances.value[accountStore.subaccountId]?.reduce(
          (total, balance) =>
            total.plus(
              new BigNumberInWei(balance.accountTotalBalanceInUsd).toBase(
                balance.token.decimals
              )
            ),
          ZERO_IN_BASE
        ) || ZERO_IN_BASE
    ),
    {
      decimalPlaces: 2
    }
  )
</script>

<template>
  <div class="h-header flex">
    <CommonSubaccountTabSelector />

    <div class="flex divide-x border-r flex-1">
      <div class="flex items-center">
        <p class="text-sm text-gray-300 px-4 flex items-center space-x-2">
          <span>Total: </span>
          <CommonSkeletonSubaccountAmount>
            <span>${{ accountTotalBalanceInUsdToString }}</span>
          </CommonSkeletonSubaccountAmount>
        </p>
      </div>

      <label class="flex px-4 flex-1">
        <div class="flex items-center">
          <SharedIcon name="search" class="text-gray-500" />
        </div>
        <input
          v-model="search"
          class="p-2 bg-transparent focus:outline-none flex-1"
          placeholder="Filter by asset"
        />
      </label>

      <div class="flex items-center px-4">
        <AppCheckbox v-model="showMarginCurrencyOnly">
          Show Margin Currency Only
        </AppCheckbox>
      </div>

      <div class="flex items-center px-4">
        <AppCheckbox v-model="hideSmallBalances">
          Hide Small Balances
        </AppCheckbox>
      </div>
    </div>
  </div>
</template>

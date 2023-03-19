<script lang="ts" setup>
import { PropType } from 'vue'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import {
  HIDDEN_BALANCE_DISPLAY,
  UI_MINIMAL_ABBREVIATION_FLOOR
} from '@/app/utils/constants'
import { AccountBalance } from '@/types'

const props = defineProps({
  hideBalances: Boolean,

  currentSubaccountBalances: {
    type: Array as PropType<AccountBalance[]>,
    required: true
  }
})

const accountTotalBalanceInUsd = computed(() =>
  props.currentSubaccountBalances.reduce(
    (total, balance) => total.plus(balance.accountTotalBalanceInUsd),
    ZERO_IN_BASE
  )
)

const shouldAbbreviateTotalBalance = computed(() =>
  accountTotalBalanceInUsd.value.gte(UI_MINIMAL_ABBREVIATION_FLOOR)
)

const { valueToString: abbreviatedTotalBalanceToString } =
  useBigNumberFormatter(accountTotalBalanceInUsd, {
    decimalPlaces: shouldAbbreviateTotalBalance.value ? 0 : 2,
    abbreviationFloor: shouldAbbreviateTotalBalance.value
      ? UI_MINIMAL_ABBREVIATION_FLOOR
      : undefined
  })
</script>

<template>
  <div class="mt-4">
    <div class="hidden xl:flex items-center gap-2">
      <span class="text-sm text-gray-400">{{
        $t('account.accountBalance')
      }}</span>
      <span v-if="!hideBalances" class="text-white text-sm">
        &dollar; {{ abbreviatedTotalBalanceToString }} USD
      </span>
      <span v-else class="text-white text-sm">
        &dollar; {{ HIDDEN_BALANCE_DISPLAY }} USD
      </span>
    </div>
  </div>
</template>

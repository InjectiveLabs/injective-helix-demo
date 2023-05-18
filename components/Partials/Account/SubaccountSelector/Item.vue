<script setup lang="ts">
import { PropType } from 'vue'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInWei } from '@injectivelabs/utils'
import {
  HIDDEN_BALANCE_DISPLAY,
  UI_MINIMAL_ABBREVIATION_FLOOR
} from '@/app/utils/constants'
import { AccountBalance } from '@/types'
import { getSubaccountIndex } from '@/app/utils/helpers'

const accountStore = useAccountStore()

const props = defineProps({
  hideBalances: Boolean,

  balances: {
    type: Array as PropType<AccountBalance[]>,
    required: true
  },

  subaccountId: {
    type: String,
    required: true
  }
})

const isSelectedSubaccountId = computed(
  () => accountStore.subaccountId === props.subaccountId
)

const subaccountIdIndex = computed(() => getSubaccountIndex(props.subaccountId))

const accountTotalBalanceInUsd = computed(() =>
  props.balances.reduce(
    (total, balance) =>
      total.plus(
        new BigNumberInWei(balance.accountTotalBalanceInUsd).toBase(
          balance.token.decimals
        )
      ),
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

function handleClick() {
  accountStore.$patch({ subaccountId: props.subaccountId })
}
</script>

<template>
  <div
    class="rounded-2xl px-4 py-2 flex min-w-3xs cursor-pointer hover:bg-white/10"
    :class="{
      'bg-white/10': isSelectedSubaccountId
    }"
    @click="handleClick"
  >
    <div class="space-y-3">
      <h3 class="flex items-center">
        <span class="text-gray-300 text-xs tracking-wide uppercase">
          {{ $t('account.account') }}
          {{
            subaccountIdIndex === 0
              ? `${$t('account.main')}`
              : subaccountIdIndex
          }}
        </span>
      </h3>
      <p class="font-sans text-lg font-semibold text-white">
        $
        {{
          hideBalances
            ? HIDDEN_BALANCE_DISPLAY
            : abbreviatedTotalBalanceToString
        }}
        USD
      </p>
    </div>
  </div>
</template>

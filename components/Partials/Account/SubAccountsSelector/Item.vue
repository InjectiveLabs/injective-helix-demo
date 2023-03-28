<script setup lang="ts">
import { PropType } from 'vue'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import {
  HIDDEN_BALANCE_DISPLAY,
  UI_MINIMAL_ABBREVIATION_FLOOR
} from '@/app/utils/constants'
import { AccountBalance } from '@/types'

const accountStore = useAccountStore()

const props = defineProps({
  subaccountId: {
    type: String,
    required: true
  },
  balances: {
    type: Array as PropType<AccountBalance[]>,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  hideBalances: {
    type: Boolean
  }
})

const isSelectedSubaccountId = computed(
  () => accountStore.subaccountId === props.subaccountId
)

const currentSubaccountBalances = computed(() => props.balances)

const accountTotalBalanceInUsd = computed(() =>
  currentSubaccountBalances.value.reduce(
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

function handleClick() {
  accountStore.$patch({ subaccountId: props.subaccountId })
}
</script>

<template>
  <div
    class="rounded-2xl px-4 py-2 flex cursor-pointer hover:bg-white/10"
    :class="{ 'bg-white/10': isSelectedSubaccountId }"
    @click="handleClick"
  >
    <div class="space-y-2">
      <h1>Subaccount {{ props.index === 0 ? 'Main' : props.index }}</h1>
      <p class="font-semibold tracking-wide text-2xl">
        $
        {{
          hideBalances
            ? HIDDEN_BALANCE_DISPLAY
            : abbreviatedTotalBalanceToString
        }}
        USD
      </p>
    </div>
    <div
      class="flex items-end px-4 py-1"
      :class="{ 'opacity-0': !isSelectedSubaccountId }"
    >
      <BaseIcon name="check" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import type { Token } from '@injectivelabs/token-metadata'
import {
  UI_DEFAULT_DISPLAY_DECIMALS,
  HIDDEN_BALANCE_DISPLAY,
  UI_MINIMAL_ABBREVIATION_FLOOR
} from '@/app/utils/constants'
import { AccountBalance, BridgeBusEvents } from '@/types'

const tokenStore = useTokenStore()
const accountStore = useAccountStore()

const props = defineProps({
  isLoading: Boolean,
  hideBalances: Boolean,

  currentSubaccountBalances: {
    type: Array as PropType<AccountBalance[]>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:hide-balances', state: boolean): void
}>()

const { aggregatedPortfolioBalances } = useBalance()

const remainingAccountBalances = computed(() =>
  Object.keys(aggregatedPortfolioBalances.value).reduce(
    (balances, subaccountId) => {
      /**
       * For the currently selected subaccount we use the currentSubaccountBalances
       * because we have the PnL and margin calculations there
       */
      if (subaccountId === accountStore.subaccountId) {
        return balances
      }

      return [...balances, ...aggregatedPortfolioBalances.value[subaccountId]]
    },
    [] as AccountBalance[]
  )
)

const currentSubaccountTotalBalanceInUsd = computed(() =>
  props.currentSubaccountBalances.reduce(
    // Already converted to human readable number
    (total, balance) => total.plus(balance.accountTotalBalanceInUsd),
    ZERO_IN_BASE
  )
)

const remainingAccountBalance = computed(() =>
  remainingAccountBalances.value.reduce(
    (total, balance) =>
      total.plus(
        new BigNumberInWei(balance.accountTotalBalanceInUsd).toBase(
          balance.token.decimals
        )
      ),
    ZERO_IN_BASE
  )
)

const accountTotalBalanceInUsd = computed(() =>
  currentSubaccountTotalBalanceInUsd.value.plus(remainingAccountBalance.value)
)

const shouldAbbreviateTotalBalance = computed(() =>
  accountTotalBalanceInUsd.value.gte(UI_MINIMAL_ABBREVIATION_FLOOR)
)

const accountTotalBalanceInBtc = computed(() => {
  if (!tokenStore.btcUsdPrice) {
    return ZERO_IN_BASE
  }

  return accountTotalBalanceInUsd.value.dividedBy(
    new BigNumberInBase(tokenStore.btcUsdPrice)
  )
})

const accountTotalBalanceInBtcToString = computed(() => {
  if (accountTotalBalanceInBtc.value.eq('0')) {
    return '0.00'
  }

  if (accountTotalBalanceInBtc.value.lte('0.0001')) {
    return '< 0.0001'
  }

  return accountTotalBalanceInBtc.value.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
})

const { valueToString: abbreviatedTotalBalanceToString } =
  useBigNumberFormatter(accountTotalBalanceInUsd, {
    decimalPlaces: shouldAbbreviateTotalBalance.value ? 0 : 2,
    abbreviationFloor: shouldAbbreviateTotalBalance.value
      ? UI_MINIMAL_ABBREVIATION_FLOOR
      : undefined
  })

function toggleHideBalances() {
  emit('update:hide-balances', !props.hideBalances)
}

function handleDepositClick() {
  useEventBus<Token | undefined>(BridgeBusEvents.Deposit).emit()
}

function handleWithdrawClick() {
  useEventBus<Token | undefined>(BridgeBusEvents.Withdraw).emit()
}
</script>

<template>
  <div :class="{ 'mb-8': !isLoading, 'my-4': isLoading }">
    <div
      class="flex justify-between md:items-center gap-4 flex-col md:flex-row"
    >
      <AppSpinner v-if="isLoading" lg />
      <div v-else class="flex items-center justify-start gap-2">
        <span
          v-if="!hideBalances"
          class="text-white font-bold text-2xl md:text-3xl"
        >
          &dollar; {{ abbreviatedTotalBalanceToString }} USD
        </span>
        <span v-else class="text-white font-bold text-2xl md:text-3xl">
          &dollar; {{ HIDDEN_BALANCE_DISPLAY }} USD
        </span>

        <span v-if="!hideBalances" class="text-gray-450 md:text-lg">
          &thickapprox; {{ accountTotalBalanceInBtcToString }} BTC
        </span>
        <span v-else class="text-gray-450 md:text-lg">
          &thickapprox; {{ HIDDEN_BALANCE_DISPLAY }} BTC
        </span>

        <div @click="toggleHideBalances">
          <BaseIcon
            v-if="hideBalances"
            name="hide"
            class="w-4 h-4 text-gray-450 hover:text-white cursor-pointer"
          />

          <BaseIcon
            v-else
            name="show"
            class="w-4 h-4 text-gray-450 hover:text-white cursor-pointer"
          />
        </div>
      </div>

      <div
        v-if="!isLoading && accountStore.isDefaultSubaccount"
        class="flex items-center justify-between md:justify-end sm:gap-4"
      >
        <AppButton class="bg-blue-500" @click="handleDepositClick">
          <span class="text-blue-900 font-semibold">
            {{ $t('account.deposit') }}
          </span>
        </AppButton>

        <AppButton class="border border-blue-500" @click="handleWithdrawClick">
          <span class="text-blue-500 font-semibold">
            {{ $t('account.withdraw') }}
          </span>
        </AppButton>
      </div>
    </div>

    <PartialsAccountSubaccountOverview
      v-if="!isLoading && accountStore.hasMultipleSubaccounts"
      v-bind="{
        hideBalances,
        currentSubaccountBalances
      }"
    />
  </div>
</template>

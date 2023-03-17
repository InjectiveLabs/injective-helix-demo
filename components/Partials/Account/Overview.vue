<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE, getExplorerUrl } from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import {
  UI_DEFAULT_DISPLAY_DECIMALS,
  HIDDEN_BALANCE_DISPLAY,
  UI_MINIMAL_ABBREVIATION_FLOOR,
  NETWORK
} from '@/app/utils/constants'
import { AccountBalance, BridgeBusEvents } from '@/types'

const tokenStore = useTokenStore()
const bankStore = useBankStore()
const walletStore = useWalletStore()

const props = defineProps({
  isLoading: Boolean,
  hideBalances: Boolean,

  balances: {
    type: Array as PropType<AccountBalance[]>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:hide-balances', state: boolean): void
}>()

const accountTotalBalance = computed(() =>
  props.balances.reduce(
    (total, balance) => total.plus(balance.accountTotalBalance),
    ZERO_IN_BASE
  )
)

const accountTotalBalanceInUsd = computed(() =>
  props.balances.reduce(
    (total, balance) => total.plus(balance.accountTotalBalanceInUsd),
    ZERO_IN_BASE
  )
)

const shouldAbbreviateTotalBalance = computed(() =>
  accountTotalBalanceInUsd.value.gte(UI_MINIMAL_ABBREVIATION_FLOOR)
)

const hasMultipleSubaccounts = computed(() => {
  return (
    walletStore.isUserWalletConnected &&
    Object.keys(bankStore.subaccountBalancesMap).length > 1
  )
})

const accountTotalBalanceInBtc = computed(() => {
  if (!tokenStore.btcUsdPrice) {
    return ZERO_IN_BASE
  }

  return accountTotalBalance.value.dividedBy(
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
        v-if="!isLoading"
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
    <span v-if="hasMultipleSubaccounts" class="text-xs text-gray-400">
      {{ $t('account.balanceBreakdownExplorer') }}
      <a
        :href="`${getExplorerUrl(NETWORK)}/account/${
          walletStore.injectiveAddress
        }/?tab=balances`"
        target="_blank"
        class="text-blue-500 font-semibold"
      >
        {{ $t('account.explorer') }}
      </a>
    </span>
  </div>
</template>

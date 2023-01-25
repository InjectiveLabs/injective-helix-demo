<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import {
  UI_MINIMAL_AMOUNT,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_DISPLAY_DECIMALS,
  HIDDEN_BALANCE_DISPLAY
} from '@/app/utils/constants'
import { getAbbreviatedVolume } from '@/app/utils/market'
import { AccountBalance, BridgeBusEvents } from '@/types'

const props = defineProps({
  hideBalances: Boolean,

  balances: {
    type: Array as PropType<AccountBalance[]>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:hide-balances', state: boolean): void
}>()

const tokenStore = useTokenStore()

const btcUsdPrice = computed(() => {
  return tokenStore.btcUsdPrice
})

const totalBalance = computed(() => {
  return props.balances
    .filter((balance) => !balance.subaccountTotalBalance.isNaN())
    .reduce((total, balance) => {
      const combinedBalance = balance.bankBalance.plus(
        balance.subaccountTotalBalance
      )

      return total.plus(combinedBalance)
    }, ZERO_IN_BASE)
})

const totalBalanceInUsd = computed(() => {
  const result = props.balances
    .filter((balance) => !balance.subaccountTotalBalance.isNaN())
    .reduce((total, balance) => {
      const combinedBalance = balance.bankBalance.plus(
        balance.subaccountTotalBalance
      )

      const combinedBalanceInUsd = combinedBalance.times(balance.token.usdPrice)

      return total.plus(combinedBalanceInUsd)
    }, ZERO_IN_BASE)

  return result
})

const abbreviatedTotalBalanceToString = computed(() => {
  if (totalBalanceInUsd.value.eq(0)) {
    return '0.00'
  }

  if (totalBalanceInUsd.value.lte(UI_MINIMAL_AMOUNT)) {
    return `< ${UI_MINIMAL_AMOUNT.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)}`
  }

  return getAbbreviatedVolume(totalBalanceInUsd.value)
})

const totalBalanceInBtc = computed(() => {
  if (!btcUsdPrice.value) {
    return ZERO_IN_BASE
  }

  return totalBalance.value.dividedBy(new BigNumberInBase(btcUsdPrice.value))
})

const totalBalanceInBtcToString = computed(() => {
  if (totalBalanceInBtc.value.eq('0')) {
    return '0.00'
  }

  if (totalBalanceInBtc.value.lte('0.0001')) {
    return '< 0.0001'
  }

  return totalBalanceInBtc.value.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
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

function handleTransferClick() {
  useEventBus<Token | undefined>(BridgeBusEvents.Transfer).emit()
}
</script>

<template>
  <div
    class="flex justify-between md:items-center mb-8 gap-4 flex-col md:flex-row"
  >
    <div class="flex items-center justify-start gap-2">
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
        &thickapprox; {{ totalBalanceInBtcToString }} BTC
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

    <div class="flex items-center justify-between md:justify-end sm:gap-4">
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

      <AppButton class="border border-blue-500" @click="handleTransferClick">
        <span class="text-blue-500 font-semibold">
          {{ $t('account.transfer') }}
        </span>
      </AppButton>
    </div>
  </div>
</template>

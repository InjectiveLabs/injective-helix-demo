<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import {
  UI_DEFAULT_DISPLAY_DECIMALS,
  HIDDEN_BALANCE_DISPLAY,
  UI_MINIMAL_ABBREVIATION_FLOOR
} from '@/app/utils/constants'
import { AccountBalance, BridgeBusEvents } from '@/types'

const tokenStore = useTokenStore()

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

const totalBalance = computed(() =>
  props.balances.reduce(
    (total, balance) => total.plus(balance.totalBalance),
    ZERO_IN_BASE
  )
)

const totalBalanceInUsd = computed(() =>
  props.balances.reduce(
    (total, balance) => total.plus(balance.totalBalanceInUsd),
    ZERO_IN_BASE
  )
)

const shouldAbbreviateTotalBalance = computed(() =>
  totalBalanceInUsd.value.gte(UI_MINIMAL_ABBREVIATION_FLOOR)
)

const totalBalanceInBtc = computed(() => {
  if (!tokenStore.btcUsdPrice) {
    return ZERO_IN_BASE
  }

  return totalBalance.value.dividedBy(
    new BigNumberInBase(tokenStore.btcUsdPrice)
  )
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

const { valueToString: abbreviatedTotalBalanceToString } =
  useBigNumberFormatter(totalBalanceInUsd, {
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

function handleTransferClick() {
  useEventBus<Token | undefined>(BridgeBusEvents.Transfer).emit()
}
</script>

<template>
  <div
    class="flex justify-between md:items-center gap-4 flex-col md:flex-row"
    :class="{ 'mb-8': !isLoading, 'my-4': isLoading }"
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

      <AppButton class="border border-blue-500" @click="handleTransferClick">
        <span class="text-blue-500 font-semibold">
          {{ $t('account.transfer') }}
        </span>
      </AppButton>
    </div>
  </div>
</template>

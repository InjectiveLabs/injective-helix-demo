<script lang="ts" setup>
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { cosmosSdkDecToBigNumber } from '@injectivelabs/sdk-ts'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import {
  UI_DEFAULT_DISPLAY_DECIMALS,
  HIDDEN_BALANCE_DISPLAY,
  UI_MINIMAL_ABBREVIATION_FLOOR
} from '@/app/utils/constants'
import { AccountBalance, BridgeType, Modal } from '@/types'

const tokenStore = useTokenStore()
const modalStore = useModalStore()
const accountStore = useAccountStore()
const exchangeStore = useExchangeStore()

const props = defineProps({
  isLoading: Boolean,
  hideBalances: Boolean
})

const emit = defineEmits<{
  (e: 'update:hide-balances', state: boolean): void
}>()

const { aggregatedPortfolioBalances } = useBalance()

const aggregatedAccountBalances = computed(() =>
  Object.keys(aggregatedPortfolioBalances.value).reduce(
    (balances, subaccountId) => [
      ...balances,
      ...aggregatedPortfolioBalances.value[subaccountId]
    ],
    [] as AccountBalance[]
  )
)

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

const stakedAmountInUsd = computed(() =>
  stakedAmount.value.times(tokenStore.injUsdPrice)
)

const accountTotalBalanceInUsd = computed(() =>
  aggregatedAccountBalances.value
    .reduce(
      (total, balance) =>
        total.plus(
          new BigNumberInWei(balance.accountTotalBalanceInUsd).toBase(
            balance.token.decimals
          )
        ),
      ZERO_IN_BASE
    )
    .plus(stakedAmountInUsd.value)
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

function handleTransferClick() {
  modalStore.openModal({ type: Modal.SubaccountTransfer })
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
          &dollar;
          <span class="font-sans">{{ abbreviatedTotalBalanceToString }}</span>
          USD
        </span>
        <span v-else class="text-white font-bold text-2xl md:text-3xl">
          &dollar; {{ HIDDEN_BALANCE_DISPLAY }} USD
        </span>

        <span v-if="!hideBalances" class="text-gray-450 md:text-lg">
          &thickapprox;
          <span class="font-sans">{{ accountTotalBalanceInBtcToString }}</span>
          BTC
        </span>
        <span v-else class="text-gray-450 md:text-lg">
          &thickapprox; {{ HIDDEN_BALANCE_DISPLAY }} BTC
        </span>

        <div
          class="text-gray-450 hover:text-white cursor-pointer"
          @click="toggleHideBalances"
        >
          <BaseIcon v-if="hideBalances" name="hide" class="w-4 h-4" />
          <BaseIcon v-else name="show" class="w-4 h-4" />
        </div>
      </div>

      <div
        v-if="!isLoading && accountStore.isDefaultSubaccount"
        class="flex items-center justify-between md:justify-end sm:gap-4"
      >
        <NuxtLink :to="{ name: 'bridge', query: { type: BridgeType.Deposit } }">
          <AppButton class="bg-blue-500">
            <span class="text-blue-900 font-semibold">
              {{ $t('account.deposit') }}
            </span>
          </AppButton>
        </NuxtLink>

        <NuxtLink
          :to="{ name: 'bridge', query: { type: BridgeType.Withdraw } }"
        >
          <AppButton class="border border-blue-500">
            <span class="text-blue-500 font-semibold">
              {{ $t('account.withdraw') }}
            </span>
          </AppButton>
        </NuxtLink>

        <AppButton class="border border-blue-500" @click="handleTransferClick">
          <span class="text-blue-500 font-semibold">
            {{ $t('account.transfer') }}
          </span>
        </AppButton>
      </div>
    </div>

    <PartialsAccountSubaccountSelector
      v-if="!isLoading"
      v-bind="{
        hideBalances
      }"
    />
  </div>
</template>

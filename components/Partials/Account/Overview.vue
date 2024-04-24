<script lang="ts" setup>
import { cosmosSdkDecToBigNumber } from '@injectivelabs/sdk-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { INJ_COIN_GECKO_ID, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import {
  BTC_COIN_GECKO_ID,
  HIDDEN_BALANCE_DISPLAY,
  UI_DEFAULT_DISPLAY_DECIMALS,
  UI_MINIMAL_ABBREVIATION_FLOOR
} from '@/app/utils/constants'
import { AccountBalance, Modal } from '@/types'

const appStore = useAppStore()
const tokenStore = useTokenStore()
const modalStore = useModalStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const exchangeStore = useExchangeStore()

const props = defineProps({
  isLoading: Boolean,
  isHideBalances: Boolean
})

const emit = defineEmits<{
  'update:hide-balances': [state: boolean]
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

const stakedAmountInUsd = computed(() => {
  const injUsdPrice = tokenStore.tokenUsdPriceByCoinGeckoId(INJ_COIN_GECKO_ID)

  if (!injUsdPrice) {
    return ZERO_IN_BASE
  }

  return stakedAmount.value.times(injUsdPrice)
})

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
  const btcUsdPrice = tokenStore.tokenUsdPriceByCoinGeckoId(BTC_COIN_GECKO_ID)

  if (!btcUsdPrice) {
    return ZERO_IN_BASE
  }

  return accountTotalBalanceInUsd.value.dividedBy(btcUsdPrice)
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
  emit('update:hide-balances', !props.isHideBalances)
}

function onTransferClick() {
  modalStore.openModal(Modal.SubaccountTransfer)
}
</script>

<template>
  <div :class="{ 'mb-8': !isLoading, 'my-4': isLoading }">
    <div
      class="flex justify-between md:items-center gap-4 flex-col md:flex-row"
    >
      <AppSpinner v-if="isLoading" is-lg />
      <div v-else class="flex items-center justify-start gap-2">
        <span
          v-if="!isHideBalances"
          class="text-white font-bold text-2xl md:text-3xl"
        >
          &dollar;
          <span class="font-sans">{{ abbreviatedTotalBalanceToString }}</span>
          USD
        </span>
        <span v-else class="text-white font-bold text-2xl md:text-3xl">
          &dollar; {{ HIDDEN_BALANCE_DISPLAY }} USD
        </span>

        <span v-if="!isHideBalances" class="text-gray-450 md:text-lg">
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
          <BaseIcon v-if="isHideBalances" name="hide" class="w-4 h-4" />
          <BaseIcon v-else name="show" class="w-4 h-4" />
        </div>
      </div>

      <div class="flex items-center justify-between md:justify-end sm:gap-4">
        <template v-if="!isLoading && accountStore.isDefaultSubaccount">
          <PartialsAccountBridgeRedirection is-deposit>
            <AppButton class="bg-blue-500">
              <span class="text-blue-900 font-semibold">
                {{ $t('account.deposit') }}
              </span>
            </AppButton>
          </PartialsAccountBridgeRedirection>

          <PartialsAccountBridgeRedirection>
            <AppButton class="border border-blue-500">
              <span class="text-blue-500 font-semibold">
                {{ $t('account.withdraw') }}
              </span>
            </AppButton>
          </PartialsAccountBridgeRedirection>
        </template>

        <AppButton
          v-if="
            appStore.isSubaccountManagementActive &&
            !walletStore.isAuthzWalletConnected &&
            !accountStore.isSgtSubaccount
          "
          :is-disabled="accountStore.isSgtSubaccount"
          class="border border-blue-500"
          @click="onTransferClick"
        >
          <span class="text-blue-500 font-semibold">
            {{ $t('account.transfer') }}
          </span>
        </AppButton>

        <PartialsAccountTransferToMainSubAccount
          v-if="accountStore.isSgtSubaccount"
        />
      </div>
    </div>

    <PartialsAccountSubaccountSelector
      v-if="!isLoading && appStore.isSubaccountManagementActive"
      v-bind="{
        isHideBalances
      }"
    />
  </div>
</template>

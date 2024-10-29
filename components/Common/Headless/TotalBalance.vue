<script setup lang="ts">
import { injToken } from '@shared/data/token'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { cosmosSdkDecToBigNumber } from '@injectivelabs/sdk-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  BTC_COIN_GECKO_ID,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { AccountBalance } from '@/types'

const tokenStore = useTokenStore()
const exchangeStore = useExchangeStore()

const { aggregatedPortfolioBalances } = useBalance()

const props = withDefaults(defineProps<{ decimalPlaces?: number }>(), {
  decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
})

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

const { valueToFixed: stakedAmountToFixed } = useSharedBigNumberFormatter(
  stakedAmount,
  { decimalPlaces: props.decimalPlaces }
)

const stakedAmountInUsd = computed(() => {
  const injUsdPrice = tokenStore.tokenUsdPrice(injToken)

  if (!injUsdPrice) {
    return ZERO_IN_BASE
  }

  return stakedAmount.value.times(injUsdPrice)
})

const { valueToFixed: stakedAmountInUsdToFixed } = useSharedBigNumberFormatter(
  stakedAmountInUsd,
  { decimalPlaces: props.decimalPlaces }
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

const accountTotalBalanceInBtc = computed(() => {
  const btcUsdPrice = tokenStore.tokenUsdPriceByCoinGeckoId(BTC_COIN_GECKO_ID)

  if (!btcUsdPrice) {
    return ZERO_IN_BASE
  }

  return accountTotalBalanceInUsd.value.dividedBy(btcUsdPrice)
})

const {
  valueToString: accountTotalBalanceInUsdToString,
  valueToFixed: accountTotalBalanceInUsdToFixed
} = useSharedBigNumberFormatter(accountTotalBalanceInUsd, {
  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
})

const { valueToString: accountTotalBalanceInBtcToString } =
  useSharedBigNumberFormatter(accountTotalBalanceInBtc, {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  })
</script>

<template>
  <slot
    v-bind="{
      stakedAmount,
      stakedAmountInUsd,
      stakedAmountToFixed,
      stakedAmountInUsdToFixed,
      accountTotalBalanceInBtc,
      accountTotalBalanceInUsd,
      accountTotalBalanceInBtcToString,
      accountTotalBalanceInUsdToString,
      accountTotalBalanceInUsdToFixed
    }"
  />
</template>

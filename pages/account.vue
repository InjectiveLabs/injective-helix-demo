<script lang="ts" setup>
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  BigNumberInBase,
  BigNumberInWei,
  Status,
  StatusType
} from '@injectivelabs/utils'
import { REFERRALS_ENABLED } from '@/app/utils/constants'

definePageMeta({
  middleware: ['connected']
})

const appStore = useAppStore()
const bankStore = useBankStore()
const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const accountStore = useAccountStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()
const { balancesWithToken, fetchTokensUsdPrice } = useBalance()

const status = reactive(new Status(StatusType.Loading))

const totalPositionsPnlByQuoteDenom = computed(() => {
  return positionStore.subaccountPositions.reduce((list, p) => {
    const market = derivativeStore.markets.find(
      (m) => m.marketId === p.marketId
    )

    if (!market) {
      return list
    }

    const quoteDenom = market.quoteDenom.toLowerCase()

    if (!list[quoteDenom]) {
      list[quoteDenom] = ZERO_IN_BASE
    }

    const price = new BigNumberInWei(p.entryPrice).toBase(
      market.quoteToken.decimals
    )
    const markPrice = new BigNumberInWei(p.markPrice).toBase(
      market.quoteToken.decimals
    )

    const pnl = new BigNumberInBase(p.quantity)
      .times(markPrice.minus(price))
      .times(p.direction === TradeDirection.Long ? 1 : -1)

    list[quoteDenom] = list[quoteDenom].plus(pnl)

    return list
  }, {} as Record<string, BigNumberInBase>)
})

const totalPositionsMarginByQuoteDenom = computed(() => {
  return positionStore.subaccountPositions.reduce((list, p) => {
    const market = derivativeStore.markets.find(
      (m) => m.marketId === p.marketId
    )

    if (!market) {
      return list
    }

    const quoteDenom = market.quoteDenom.toLowerCase()

    if (!list[quoteDenom]) {
      list[quoteDenom] = ZERO_IN_BASE
    }

    list[quoteDenom] = list[quoteDenom].plus(
      new BigNumberInWei(p.margin).toBase(market.quoteToken.decimals)
    )

    return list
  }, {} as Record<string, BigNumberInBase>)
})

const balances = computed(() => {
  return balancesWithToken.value.map((balance) => {
    const denom = balance.denom.toLowerCase()
    const usdPrice = balance.usdPrice

    const margin = totalPositionsMarginByQuoteDenom.value[denom] || ZERO_IN_BASE
    const pnl = totalPositionsPnlByQuoteDenom.value[denom] || ZERO_IN_BASE

    const subaccountBalance = accountStore.subaccount?.balances.find(
      (subaccountBalance) => subaccountBalance.denom === denom
    )

    const inOrderBalance = subaccountBalance
      ? new BigNumberInBase(subaccountBalance.totalBalance).minus(
          subaccountBalance.availableBalance
        )
      : ZERO_IN_BASE
    const inOrderBalanceInToken = new BigNumberInWei(inOrderBalance).toBase(
      balance.token.decimals
    )

    const reservedBalance = inOrderBalanceInToken.plus(margin).plus(pnl)
    const totalBalance = reservedBalance.plus(balance.balanceInToken)
    const totalBalanceInUsd = totalBalance.times(usdPrice)

    return {
      ...balance,
      totalBalance: totalBalance.toFixed(),
      totalBalanceInUsd: totalBalanceInUsd.toFixed(),
      reservedBalance: reservedBalance.toFixed()
    }
  })
})

onWalletConnected(() => {
  status.setLoading()

  Promise.all([spotStore.init(), derivativeStore.init()])
    .then(() => {
      Promise.all([
        tokenStore.getBitcoinUsdPrice(),
        bankStore.fetchBankBalancesWithToken(),
        accountStore.fetchSubaccounts(),
        fetchTokensUsdPrice()
      ])
        .catch($onError)
        .finally(() => {
          status.setIdle()
        })
    })
    .catch($onError)
})

useIntervalFn(appStore.pollMarkets, 1000 * 10)
useIntervalFn(fetchTokensUsdPrice, 1000 * 30)
</script>

<template>
  <AppHocLoading :status="status">
    <div class="h-full-flex">
      <PartialsAccount :balances="balances" />
      <ModalsRefereeOnboarding v-if="REFERRALS_ENABLED" />
    </div>
  </AppHocLoading>
</template>

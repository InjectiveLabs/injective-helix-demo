<script lang="ts" setup>
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  Status,
  StatusType,
  BigNumberInWei,
  BigNumberInBase
} from '@injectivelabs/utils'
import { AccountBalance } from '@/types'

definePageMeta({
  middleware: ['connected']
})

const appStore = useAppStore()
const accountStore = useAccountStore()
const spotStore = useSpotStore()
const walletStore = useWalletStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()
const { accountBalancesWithTokenInBases } = useBalance()

const status = reactive(new Status(StatusType.Loading))

const totalPositionsPnlByQuoteDenom = computed(() => {
  return positionStore.subaccountPositions.reduce((positions, p) => {
    const market = derivativeStore.markets.find(
      (m) => m.marketId === p.marketId
    )

    if (!market) {
      return positions
    }

    const quoteDenom = market.quoteDenom.toLowerCase()

    if (!positions[quoteDenom]) {
      positions[quoteDenom] = ZERO_IN_BASE
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

    positions[quoteDenom] = positions[quoteDenom].plus(pnl)

    return positions
  }, {} as Record<string, BigNumberInBase>)
})

const totalPositionsMarginByQuoteDenom = computed(() =>
  positionStore.subaccountPositions.reduce((positions, position) => {
    const market = derivativeStore.markets.find(
      (m) => m.marketId === position.marketId
    )

    if (!market) {
      return positions
    }

    const quoteDenom = market.quoteDenom.toLowerCase()

    if (!positions[quoteDenom]) {
      positions[quoteDenom] = ZERO_IN_BASE
    }

    positions[quoteDenom] = positions[quoteDenom].plus(
      new BigNumberInWei(position.margin).toBase(market.quoteToken.decimals)
    )

    return positions
  }, {} as Record<string, BigNumberInBase>)
)

const balances = computed(() => {
  return accountBalancesWithTokenInBases.value.map((balance) => {
    const denom = balance.denom.toLowerCase()

    const margin = totalPositionsMarginByQuoteDenom.value[denom] || ZERO_IN_BASE
    const pnl = totalPositionsPnlByQuoteDenom.value[denom] || ZERO_IN_BASE

    const accountTotalBalance = new BigNumberInBase(balance.accountTotalBalance)
      .plus(margin)
      .plus(pnl)
    const accountTotalBalanceInUsd = accountTotalBalance.times(balance.usdPrice)

    return {
      ...balance,
      accountTotalBalance: accountTotalBalance.toFixed(),
      accountTotalBalanceInUsd: accountTotalBalanceInUsd.toFixed(),
      unrealizedPnl: margin.plus(pnl).toFixed()
    } as AccountBalance
  })
})

onMounted(() => {
  status.setLoading()

  Promise.all([
    spotStore.init(),
    derivativeStore.init(),
    accountStore.streamBankBalance(),
    accountStore.fetchAccountPortfolio(),
    accountStore.streamSubaccountBalance()
  ])
    .catch($onError)
    .finally(() => status.setIdle())
})

useIntervalFn(appStore.pollMarkets, 1000 * 10)
</script>

<template>
  <AppHocLoading
    class="h-full"
    :status="status"
    :show-loading="!walletStore.isUserWalletConnected"
  >
    <div class="container">
      <div class="w-full mx-auto 3xl:w-11/12 4xl:w-10/12 relative">
        <PartialsAccount :balances="balances" />
      </div>
    </div>
  </AppHocLoading>
</template>

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
import { AccountBalance } from '~~/types'
import { getCoinGeckoIdListWithDenomBalanceLargerThenZero } from '@/composables/account/useBalance'

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
const { balancesWithToken } = useBalance()

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

const totalPositionsMarginByQuoteDenom = computed(() => {
  return positionStore.subaccountPositions.reduce((positions, position) => {
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
})

const balances = computed(() => {
  return balancesWithToken.value.map((balance) => {
    const denom = balance.denom.toLowerCase()
    const usdPrice = balance.usdPrice

    const margin = totalPositionsMarginByQuoteDenom.value[denom] || ZERO_IN_BASE
    const pnl = totalPositionsPnlByQuoteDenom.value[denom] || ZERO_IN_BASE

    const subaccountBalance = accountStore.subaccountBalances.find(
      (balance) => balance.denom.toLowerCase() === denom
    )
    const subaccountAvailableBalance =
      subaccountBalance?.availableBalance || '0'
    const subaccountTotalBalance = subaccountBalance?.totalBalance || '0'

    const bankBalanceDenom =
      Object.keys(bankStore.bankBalances).find(
        (balanceDenom) => balanceDenom.toLowerCase() === denom
      ) || ''
    const bankBalance = bankStore.bankBalances[bankBalanceDenom]

    const inOrderBalance = new BigNumberInBase(subaccountTotalBalance).minus(
      subaccountAvailableBalance
    )

    const reservedBalance = new BigNumberInWei(inOrderBalance)
      .toBase(balance.token.decimals)
      .plus(margin)
      .plus(pnl)
    const totalBalance = reservedBalance.plus(balance.balanceToBase)
    const totalBalanceInUsd = totalBalance.times(usdPrice)

    return {
      ...balance,
      bankBalance: new BigNumberInWei(bankBalance)
        .toBase(balance.token.decimals)
        .toFixed(),
      subaccountBalance: new BigNumberInWei(subaccountAvailableBalance)
        .toBase(balance.token.decimals)
        .toFixed(),
      totalBalance: totalBalance.toFixed(),
      totalBalanceInUsd: totalBalanceInUsd.toFixed(),
      reservedBalance: reservedBalance.toFixed()
    } as AccountBalance
  })
})

function fetchTokensUsdPrice() {
  const coinGeckoIdList = getCoinGeckoIdListWithDenomBalanceLargerThenZero(
    balancesWithToken.value,
    tokenStore.tokens
  )

  tokenStore.fetchTokenUsdPriceMap(coinGeckoIdList)
}

onMounted(() => {
  status.setLoading()

  Promise.all([spotStore.init(), derivativeStore.init()])
    .then(() => {
      Promise.all([
        tokenStore.fetchBitcoinUsdPrice(),
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

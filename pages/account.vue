<script lang="ts" setup>
import {
  ZERO_TO_STRING,
  getTokenLogoWithVendorPathPrefix,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  BigNumberInBase,
  BigNumberInWei,
  Status,
  StatusType
} from '@injectivelabs/utils'
import { REFERRALS_ENABLED } from '@/app/utils/constants'
import { AccountBalance } from '@/types'

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

const status = reactive(new Status(StatusType.Loading))

const bankBalancesWithUsdBalanceAndUsdPrice = computed(() => {
  return [
    ...tokenStore.erc20TokensWithBalanceAndPriceFromBank,
    ...tokenStore.ibcTokensWithBalanceAndPriceFromBank
  ].map((tokenWithBalance) => {
    const balance =
      bankStore.bankBalancesWithToken.find(
        ({ denom }) => denom === tokenWithBalance.denom
      )?.balance || ZERO_TO_STRING

    return {
      balance,
      denom: tokenWithBalance.denom,
      token: {
        ...tokenWithBalance
      }
    }
  })
})

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

const subaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd = computed(() => {
  return accountStore.subaccountBalancesWithTokenAndPrice.map((balance) => {
    const denom = balance.token.denom.toLowerCase()
    const usdPrice = balance.token.usdPrice

    const margin = totalPositionsMarginByQuoteDenom.value[denom] || ZERO_IN_BASE
    const pnl = totalPositionsPnlByQuoteDenom.value[denom] || ZERO_IN_BASE

    const balanceInBigNumber = new BigNumberInWei(balance.totalBalance).toBase(
      balance.token.decimals
    )

    const availableBalanceInBigNumber = new BigNumberInWei(
      balance.availableBalance
    ).toBase(balance.token.decimals)

    const pnlInAssetCount = pnl.dividedBy(usdPrice)
    const totalBalance = balanceInBigNumber.plus(margin).plus(pnlInAssetCount)

    return {
      ...balance,
      margin,
      totalBalance,
      inOrderBalance: balanceInBigNumber.minus(availableBalanceInBigNumber),
      pnlInUsd: pnl,
      totalBalanceInUsd: balanceInBigNumber
        .plus(margin)
        .times(usdPrice)
        .plus(pnl),
      token: {
        ...balance.token,
        logo: getTokenLogoWithVendorPathPrefix(balance.token.logo)
      }
    }
  })
})

const balances = computed(() => {
  const balances = bankBalancesWithUsdBalanceAndUsdPrice.value.reduce(
    (result, balance) => {
      result.push({
        bankBalance: new BigNumberInWei(balance.balance || 0).toBase(
          balance.token.decimals
        ),
        subaccountAvailableBalance: ZERO_IN_BASE,
        subaccountTotalBalance: ZERO_IN_BASE,
        inOrderBalance: ZERO_IN_BASE,
        margin: ZERO_IN_BASE,
        pnl: ZERO_IN_BASE,
        token: balance.token
      } as AccountBalance)

      return result
    },
    [] as AccountBalance[]
  )

  subaccountBalanceWithTokenMarginAndPnlTotalBalanceInUsd.value.reduce(
    (result, balance) => {
      const index = result.findIndex(
        (b) => b.token.denom === balance.token.denom
      )

      const subaccountAvailableBalance = new BigNumberInWei(
        balance.availableBalance
      ).toBase(balance.token.decimals)

      if (index === -1) {
        result.push({
          bankBalance: ZERO_IN_BASE,
          subaccountAvailableBalance,
          subaccountTotalBalance: balance.totalBalance,
          inOrderBalance: balance.inOrderBalance,
          margin: balance.margin,
          pnl: balance.pnlInUsd,
          token: { ...balance.token, usdPrice: 0 }
        })
      } else {
        const existingBalance = result[index]

        result[index] = {
          ...existingBalance,
          subaccountAvailableBalance,
          subaccountTotalBalance: balance.totalBalance,
          inOrderBalance: balance.inOrderBalance,
          margin: balance.margin,
          pnl: balance.pnlInUsd
        }
      }

      return result
    },
    balances
  )

  return balances
})

onWalletConnected(() => {
  status.setLoading()

  Promise.all([spotStore.init(), derivativeStore.init()])
    .then(() => {
      Promise.all([
        tokenStore.getBitcoinUsdPrice(),
        bankStore.fetchBankBalancesWithToken(),
        accountStore.fetchSubaccounts()
      ])
        .catch($onError)
        .finally(() => {
          status.setIdle()
        })
    })
    .catch($onError)
})

useIntervalFn(appStore.pollMarkets, 1000 * 10)
</script>

<template>
  <AppHocLoading :status="status">
    <div class="h-full-flex">
      <PartialsAccount :balances="balances" />
      <ModalsRefereeOnboarding v-if="REFERRALS_ENABLED" />
    </div>
  </AppHocLoading>
</template>

import { format } from 'date-fns'
import { AtomicSwap } from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { type Token } from '@injectivelabs/token-metadata'
import {
  toBalanceInToken,
  convertCoinToBalancesWithToken
} from '@/app/utils/formatters'
import { DATE_TIME_DISPLAY, MAX_QUOTE_DECIMALS } from '@/app/utils/constants'
import { getExplorerUrl } from '@/app/utils/network'

export function useSwapHistory(swap: Ref<AtomicSwap>) {
  const tokenStore = useTokenStore()

  const time = format(swap.value.executedAt, DATE_TIME_DISPLAY)
  const explorerLink = `${getExplorerUrl()}/transaction/${swap.value.txHash}`

  const destinationTokenWithBalance = computed(() => {
    if (!swap.value.destinationCoin) {
      return
    }

    return convertCoinToBalancesWithToken(swap.value.destinationCoin)
  })

  const sourceTokenWithBalance = computed(() => {
    if (!swap.value.sourceCoin) {
      return
    }

    return convertCoinToBalancesWithToken(swap.value.sourceCoin)
  })

  const destinationBalanceFormatted = computed(() => {
    if (!destinationTokenWithBalance.value) {
      return
    }

    return toBalanceInToken({
      value: destinationTokenWithBalance.value.balance,
      decimalPlaces: destinationTokenWithBalance.value.token.decimals,
      fixedDecimals: 3
    }).toString()
  })

  const sourceBalanceFormatted = computed(() => {
    if (!sourceTokenWithBalance.value) {
      return
    }

    return toBalanceInToken({
      value: sourceTokenWithBalance.value.balance,
      decimalPlaces: sourceTokenWithBalance.value.token.decimals,
      fixedDecimals: 3
    }).toString()
  })

  const formattedFees = computed(() =>
    swap.value.fees.map(({ denom, amount }) => {
      const token = tokenStore.tokens.find(
        (token: Token) => token.denom === denom
      )
      const amountInToken = toBalanceInToken({
        value: amount,
        decimalPlaces: token?.decimals || 18,
        fixedDecimals: MAX_QUOTE_DECIMALS
      })

      if (new BigNumberInBase(amountInToken).lt(0.001)) {
        return `<0.001 ${token?.symbol}`
      }

      return `${amountInToken} ${token?.symbol}`
    })
  )

  const routeSymbols = computed(() => {
    const routeDenoms = swap.value.route.split('-')

    return routeDenoms.reduce((symbols, denom) => {
      const token = tokenStore.tokens.find(
        (token: Token) => token.denom === denom
      )

      if (!token) {
        return [...symbols]
      }

      return [...symbols, token.symbol]
    }, [] as string[])
  })

  return {
    time,
    explorerLink,
    routeSymbols,
    formattedFees,
    sourceBalanceFormatted,
    sourceTokenWithBalance,
    destinationTokenWithBalance,
    destinationBalanceFormatted
  }
}

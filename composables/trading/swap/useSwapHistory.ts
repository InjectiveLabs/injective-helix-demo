import { format } from 'date-fns'
import { AtomicSwap } from '@injectivelabs/sdk-ts'
import { getExplorerUrl } from '@shared/utils/network'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import {
  toBalanceInToken,
  convertCoinToBalancesWithToken
} from '@/app/utils/formatters'
import {
  DATE_TIME_DISPLAY,
  MAX_QUOTE_DECIMALS,
  UI_DEFAULT_AGGREGATION_DECIMALS
} from '@/app/utils/constants'

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
      return ZERO_IN_BASE
    }

    return toBalanceInToken({
      value: destinationTokenWithBalance.value.balance,
      decimalPlaces: destinationTokenWithBalance.value.token.decimals,
      fixedDecimals: 3
    }).toString()
  })

  const { valueToFixed: destinationBalanceFormattedToFixed } =
    useSharedBigNumberFormatter(destinationBalanceFormatted, {
      decimalPlaces: UI_DEFAULT_AGGREGATION_DECIMALS
    })

  const sourceBalanceFormatted = computed(() => {
    if (!sourceTokenWithBalance.value) {
      return ZERO_IN_BASE
    }

    return toBalanceInToken({
      value: sourceTokenWithBalance.value.balance,
      decimalPlaces: sourceTokenWithBalance.value.token.decimals,
      fixedDecimals: 3
    })
  })

  const { valueToFixed: sourceBalanceFormattedToFixed } =
    useSharedBigNumberFormatter(sourceBalanceFormatted, {
      decimalPlaces: UI_DEFAULT_AGGREGATION_DECIMALS
    })

  const formattedFees = computed(() =>
    swap.value.fees.map(({ denom, amount }) => {
      const token = tokenStore.tokenByDenomOrSymbol(denom)

      const amountInToken = toBalanceInToken({
        value: amount,
        decimalPlaces: token?.decimals || 18,
        fixedDecimals: MAX_QUOTE_DECIMALS
      })

      return { amount: amountInToken, symbol: token?.symbol }
    })
  )

  const routeSymbols = computed(() => {
    const routeDenoms = swap.value.route.split('-')

    return routeDenoms.reduce((symbols, denom) => {
      const token = tokenStore.tokenByDenomOrSymbol(denom)

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
    sourceBalanceFormattedToFixed,
    sourceTokenWithBalance,
    destinationTokenWithBalance,
    destinationBalanceFormatted,
    destinationBalanceFormattedToFixed
  }
}

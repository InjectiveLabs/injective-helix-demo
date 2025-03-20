import { format } from 'date-fns'
import { AtomicSwap } from '@injectivelabs/sdk-ts'
import { getExplorerUrl } from '@shared/utils/network'
import { sharedToBalanceInToken } from '@shared/utils/formatter'
import { convertCoinToBalancesWithToken } from '@/app/utils/formatters'
import { DATE_TIME_DISPLAY, MAX_QUOTE_DECIMALS } from '@/app/utils/constants'
import { HistorySwapTableColumn } from '@/types'

export function useHistorySwapTransformer(swapList: ComputedRef<AtomicSwap[]>) {
  const tokenStore = useTokenStore()

  const rows = computed(() => {
    return swapList.value.map((swap) => {
      const routeDenoms = swap.route.split('-')

      const routeSymbols = routeDenoms.reduce((symbols, denom) => {
        const token = tokenStore.tokenByDenomOrSymbol(denom)

        if (!token) {
          return [...symbols]
        }

        return [...symbols, token.symbol]
      }, [] as string[])

      const formattedFees = swap.fees.map(({ denom, amount }) => {
        const token = tokenStore.tokenByDenomOrSymbol(denom)

        const amountInToken = sharedToBalanceInToken({
          value: amount,
          decimalPlaces: token?.decimals || 18,
          fixedDecimals: MAX_QUOTE_DECIMALS
        })

        return { amount: amountInToken, symbol: token?.symbol || '' }
      })

      const sourceTokenWithBalance = swap.sourceCoin
        ? convertCoinToBalancesWithToken(swap.sourceCoin)
        : null

      const destinationTokenWithBalance = swap.destinationCoin
        ? convertCoinToBalancesWithToken(swap.destinationCoin)
        : null

      const sourceBalanceFormatted = !sourceTokenWithBalance
        ? '0'
        : sharedToBalanceInToken({
            value: sourceTokenWithBalance.balance,
            decimalPlaces: sourceTokenWithBalance.token.decimals,
            fixedDecimals: 3
          })

      const destinationBalanceFormatted = !destinationTokenWithBalance
        ? '0'
        : sharedToBalanceInToken({
            value: destinationTokenWithBalance.balance,
            decimalPlaces: destinationTokenWithBalance.token.decimals,
            fixedDecimals: 3
          })

      return {
        routeSymbols,
        formattedFees,
        txHash: swap.txHash,
        sourceTokenWithBalance,
        sourceBalanceFormatted,
        destinationTokenWithBalance,
        destinationBalanceFormatted,
        explorerLink: `${getExplorerUrl()}/transaction/${swap.txHash}`,
        [HistorySwapTableColumn.Time]: format(
          swap.executedAt,
          DATE_TIME_DISPLAY
        )
      }
    })
  })

  return { rows }
}

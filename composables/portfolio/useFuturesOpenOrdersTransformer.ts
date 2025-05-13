import { BigNumberInBase } from '@injectivelabs/utils'
import { MsgType, OrderSide } from '@injectivelabs/ts-types'
import { sharedToBalanceInToken } from '@shared/utils/formatter'
import { PortfolioFuturesOpenOrdersTableColumn } from '@/types'
import type { DerivativeLimitOrder } from '@injectivelabs/sdk-ts'
import type {
  AccountBalance,
  TransformedPortfolioFuturesOpenOrders
} from '@/types'

export function useFuturesOpenOrdersTransformer(
  orderList: ComputedRef<DerivativeLimitOrder[]>,
  userBalancesWithToken: ComputedRef<AccountBalance[]>
) {
  const authZStore = useAuthZStore()
  const orderbookStore = useOrderbookStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  const orderTypeMap: Partial<Record<OrderSide, boolean>> = {
    [OrderSide.Buy]: true,
    [OrderSide.BuyPO]: true,
    [OrderSide.TakeBuy]: true,
    [OrderSide.StopBuy]: true
  }

  const rows = computed(() =>
    orderList.value.reduce((list, order) => {
      const market = derivativeStore.marketByIdOrSlug(order.marketId)

      if (!market) {
        return list
      }

      const price = sharedToBalanceInTokenInBase({
        value: order.price,
        decimalPlaces: market.quoteToken?.decimals
      })

      const isBuy = orderTypeMap[order.orderType as OrderSide] || false

      const quantity = new BigNumberInBase(order.quantity)

      const total = quantity.multipliedBy(price)

      const margin = sharedToBalanceInTokenInBase({
        value: (order as DerivativeLimitOrder).margin,
        decimalPlaces: market.quoteToken.decimals
      })

      const isReduceOnly = !margin
        ? false
        : (order as DerivativeLimitOrder).isReduceOnly || margin.isZero()

      const priceInBigNumber = new BigNumberInBase(price)

      const leverage = isReduceOnly
        ? new BigNumberInBase('')
        : new BigNumberInBase(
            priceInBigNumber.times(quantity).dividedBy(margin)
          )

      const unfilledQuantity = new BigNumberInBase(order.unfilledQuantity)

      const isAuthorized =
        !sharedWalletStore.isAuthzWalletConnected ||
        authZStore.hasAuthZPermission(MsgType.MsgCancelDerivativeOrder)

      const balance = userBalancesWithToken.value.find(
        (balance) => balance.denom === market.quoteDenom
      )

      const accountQuoteBalance = sharedToBalanceInToken({
        value: balance?.availableBalance || 0,
        decimalPlaces: market.quoteToken.decimals
      })

      const chasePrice = isBuy
        ? orderbookStore.buys[0]?.price
        : orderbookStore.sells[0]?.price

      const newChasePrice = new BigNumberInBase(chasePrice || 0)

      const newChaseMargin = newChasePrice.times(total).dividedBy(price)

      const chaseBalanceNeeded = newChaseMargin.minus(total)

      const insufficientBalance = isReduceOnly
        ? false
        : chaseBalanceNeeded.gt(accountQuoteBalance)

      list.push({
        order,
        isBuy,
        quantity,
        isReduceOnly,
        isAuthorized,
        newChasePrice,
        newChaseMargin,
        unfilledQuantity,
        chaseBalanceNeeded,
        accountQuoteBalance,
        insufficientBalance,
        priceDecimals: market.priceDecimals,
        quantityDecimals: market.quantityDecimals,
        filledQuantity: quantity.minus(unfilledQuantity),
        [PortfolioFuturesOpenOrdersTableColumn.Price]: price,
        [PortfolioFuturesOpenOrdersTableColumn.Total]: total,
        [PortfolioFuturesOpenOrdersTableColumn.Market]: market,
        [PortfolioFuturesOpenOrdersTableColumn.Leverage]: leverage
      })

      return list
    }, [] as TransformedPortfolioFuturesOpenOrders[])
  )

  return { rows }
}

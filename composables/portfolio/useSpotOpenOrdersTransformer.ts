import { ZERO_IN_BASE } from '@shared/utils/constant'
import { SpotLimitOrder } from '@injectivelabs/sdk-ts'
import { MsgType, OrderSide } from '@injectivelabs/ts-types'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import { toBalanceInToken } from '@/app/utils/formatters'
import {
  UiSpotMarket,
  AccountBalance,
  PortfolioSpotOpenOrdersTableColumn,
  TransformedPortfolioSpotOpenOrders
} from '@/types'

export function useSpotOpenOrdersTransformer(
  orderList: ComputedRef<SpotLimitOrder[]>,
  userBalancesWithToken: ComputedRef<AccountBalance[]>
) {
  const spotStore = useSpotStore()
  const authZStore = useAuthZStore()
  const orderbookStore = useOrderbookStore()
  const sharedWalletStore = useSharedWalletStore()

  const rows = computed(() =>
    orderList.value.reduce((list, order) => {
      const market = spotStore.markets.find(
        (market) => market.marketId === order.marketId
      )

      if (!market) {
        return list
      }

      const price = market.baseToken
        ? sharedToBalanceInWei({
            value: order.price,
            decimalPlaces:
              market.baseToken.decimals - market.quoteToken.decimals
          })
        : new BigNumberInWei(order.price).toBase(market.quoteToken.decimals)

      const quantity = new BigNumberInWei(order.quantity).toBase(
        (market as UiSpotMarket).baseToken.decimals
      )

      const isBuy = (order as SpotLimitOrder).orderSide === OrderSide.Buy

      const unfilledQuantity = new BigNumberInWei(
        order.unfilledQuantity
      ).toBase((market as UiSpotMarket).baseToken.decimals)

      const filledQuantity = quantity.minus(unfilledQuantity)

      const filledQuantityPercentage = filledQuantity.lte(0)
        ? ZERO_IN_BASE
        : new BigNumberInBase(filledQuantity.dividedBy(quantity).times(100))

      const isAuthorized =
        !sharedWalletStore.isAuthzWalletConnected ||
        authZStore.hasAuthZPermission(MsgType.MsgCancelSpotOrder)

      const balance = userBalancesWithToken.value.find(
        (balance) => balance.denom === market.quoteDenom
      )

      const accountQuoteBalance = toBalanceInToken({
        value: balance?.availableMargin || 0,
        decimalPlaces: market.quoteToken.decimals
      })

      const highestBid = new BigNumberInBase(orderbookStore.buys[0]?.price)

      const orderTotalQuote = price.times(quantity)

      const chaseTotalQuote = highestBid.times(quantity)

      const chaseBalanceNeeded = chaseTotalQuote.minus(orderTotalQuote)

      list.push({
        order,
        isBuy,
        quantity,
        highestBid,
        isAuthorized,
        filledQuantity,
        chaseTotalQuote,
        orderTotalQuote,
        unfilledQuantity,
        chaseBalanceNeeded,
        accountQuoteBalance,
        priceDecimals: market.priceDecimals,
        total: quantity.multipliedBy(price),
        quantityDecimals: market.quantityDecimals,
        orderFillable: unfilledQuantity.lte(quantity),
        insufficientBalance: chaseBalanceNeeded.gt(accountQuoteBalance),
        filledQuantityPercentageToFormat: filledQuantityPercentage.toFormat(2),
        [PortfolioSpotOpenOrdersTableColumn.Price]: price,
        [PortfolioSpotOpenOrdersTableColumn.Market]: market
      })

      return list
    }, [] as TransformedPortfolioSpotOpenOrders[])
  )

  return { rows }
}

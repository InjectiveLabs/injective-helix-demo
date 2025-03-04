import {
  sharedToBalanceInToken,
  sharedToBalanceInTokenInBase
} from '@shared/utils/formatter'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { SpotLimitOrder } from '@injectivelabs/sdk-ts'
import { MsgType, OrderSide } from '@injectivelabs/ts-types'
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
        : sharedToBalanceInTokenInBase({
            value: order.price,
            decimalPlaces: market.quoteToken.decimals
          })

      const quantity = sharedToBalanceInTokenInBase({
        value: order.quantity,
        decimalPlaces: (market as UiSpotMarket).baseToken.decimals
      })

      const isBuy = (order as SpotLimitOrder).orderSide === OrderSide.Buy

      const unfilledQuantity = sharedToBalanceInTokenInBase({
        value: order.unfilledQuantity,
        decimalPlaces: (market as UiSpotMarket).baseToken.decimals
      })

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

      const accountQuoteBalance = sharedToBalanceInToken({
        value: balance?.availableBalance || 0,
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
        [PortfolioSpotOpenOrdersTableColumn.Price]: price,
        [PortfolioSpotOpenOrdersTableColumn.Market]: market,
        insufficientBalance: chaseBalanceNeeded.gt(accountQuoteBalance),
        filledQuantityPercentageToFormat: filledQuantityPercentage.toFormat(2)
      })

      return list
    }, [] as TransformedPortfolioSpotOpenOrders[])
  )

  return { rows }
}

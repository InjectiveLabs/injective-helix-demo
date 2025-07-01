import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MsgType, TradeDirection } from '@injectivelabs/ts-types'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import { isTradingBotSubaccountId } from '@/app/utils/helpers'
import { calculateScaledMarkPrice } from '@/app/client/utils/derivatives'
import { PositionTableColumn, ConditionalOrderSide } from '@/types'
import type { TransformedPosition } from '@/types'
import type { PositionV2 } from '@injectivelabs/sdk-ts'

export function usePositionTransformer(
  positionList: ComputedRef<PositionV2[]>
) {
  const authZStore = useAuthZStore()
  const sharedTokenStore = useSharedTokenStore()
  const derivativeStore = useDerivativeStore()
  const gridStrategyStore = useGridStrategyStore()
  const sharedWalletStore = useSharedWalletStore()

  const rows = computed(() =>
    positionList.value.reduce((list, position) => {
      const market = derivativeStore.marketByIdOrSlug(position.marketId)

      if (!market) {
        return list
      }

      const margin = sharedToBalanceInTokenInBase({
        value: position.margin,
        decimalPlaces: market.quoteToken.decimals
      })

      const markPriceFromStream =
        derivativeStore.marketMarkPriceMap[market.marketId || '']

      const markPriceNotScaled = markPriceFromStream
        ? new BigNumberInBase(markPriceFromStream.price)
        : sharedToBalanceInTokenInBase({
            value: position.markPrice,
            decimalPlaces: market.quoteToken.decimals
          })

      const markPrice = calculateScaledMarkPrice({
        market,
        markPriceNotScaled
      })

      const price = sharedToBalanceInTokenInBase({
        value: position.entryPrice,
        decimalPlaces: market.quoteToken.decimals
      })

      const pnl = new BigNumberInBase(position.quantity)
        .times(markPrice.minus(price))
        .times(position.direction === TradeDirection.Long ? 1 : -1)

      const quantity = new BigNumberInBase(position.quantity)

      const usedQuantity = derivativeStore.subaccountOrders.reduce(
        (sum, order) => {
          return order.isReduceOnly && order.marketId === market.marketId
            ? sum.plus(order.quantity)
            : sum
        },
        ZERO_IN_BASE
      )

      const percentagePnl = pnl.isNaN()
        ? ZERO_IN_BASE
        : new BigNumberInBase(pnl.dividedBy(margin).times(100))

      const liquidationPriceData = sharedToBalanceInTokenInBase({
        value: position.liquidationPrice,
        decimalPlaces: market.quoteToken.decimals
      })

      const liquidationPrice = liquidationPriceData.gt(0)
        ? liquidationPriceData
        : new BigNumberInBase(0)

      const notionalValue = markPrice.times(quantity)

      const effectiveLeverage = new BigNumberInBase(
        notionalValue.dividedBy(margin.plus(pnl))
      )

      const isMarketOrderAuthorized =
        !sharedWalletStore.isAuthzWalletConnected ||
        authZStore.hasAuthZPermission(MsgType.MsgCreateDerivativeMarketOrder)

      const isLimitOrderAuthorized =
        !sharedWalletStore.isAuthzWalletConnected ||
        authZStore.hasAuthZPermission(MsgType.MsgCreateDerivativeLimitOrder)

      const reduceOnlyCurrentOrders = derivativeStore.subaccountOrders.filter(
        (order) => order.isReduceOnly && order.marketId === position.marketId
      )

      const hasActiveStrategy =
        !!gridStrategyStore.activeDerivativeStrategies.find(
          (strategy) => strategy.subaccountId === position.subaccountId
        )

      const quantityInUsd = quantity
        .times(markPrice)
        .times(sharedTokenStore.tokenUsdPrice(market.quoteToken) || 0)

      const tpOrder = derivativeStore.subaccountConditionalOrders.find(
        (order) =>
          order.marketId === position.marketId &&
          (order.orderType === ConditionalOrderSide.TakeBuy ||
            order.orderType === ConditionalOrderSide.TakeSell)
      )

      const tpTriggerPrice = tpOrder
        ? sharedToBalanceInTokenInBase({
            value: tpOrder.triggerPrice,
            decimalPlaces: market.quoteToken.decimals
          })
        : undefined

      const slOrder = derivativeStore.subaccountConditionalOrders.find(
        (order) =>
          order.marketId === position.marketId &&
          (order.orderType === ConditionalOrderSide.StopBuy ||
            order.orderType === ConditionalOrderSide.StopSell)
      )

      const slTriggerPrice = slOrder
        ? sharedToBalanceInTokenInBase({
            value: slOrder.triggerPrice,
            decimalPlaces: market.quoteToken.decimals
          })
        : undefined

      list.push({
        pnl,
        price,
        position,
        quantity,
        markPrice,
        usedQuantity,
        percentagePnl,
        quantityInUsd,
        tpTriggerPrice,
        slTriggerPrice,
        liquidationPrice,
        effectiveLeverage,
        hasActiveStrategy,
        isLimitOrderAuthorized,
        reduceOnlyCurrentOrders,
        isMarketOrderAuthorized,
        subaccountId: position.subaccountId,
        priceDecimals: market.priceDecimals,
        quantityDecimals: market.quantityDecimals,
        hasTpSl: !!tpTriggerPrice || !!slTriggerPrice,
        availableQuantity: quantity.minus(usedQuantity),
        hasReduceOnlyOrders: !!reduceOnlyCurrentOrders.length,
        isTradingBotSubaccount: !!isTradingBotSubaccountId(
          position.subaccountId
        ),
        [PositionTableColumn.Market]: market,
        [PositionTableColumn.Margin]: margin
      })

      return list
    }, [] as TransformedPosition[])
  )

  return { rows }
}

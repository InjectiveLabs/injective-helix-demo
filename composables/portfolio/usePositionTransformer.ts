import { ZERO_IN_BASE } from '@shared/utils/constant'
import { PositionV2 } from '@injectivelabs/sdk-ts'
import { MsgType, TradeDirection } from '@injectivelabs/ts-types'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import { calculateScaledMarkPrice } from '@/app/client/utils/derivatives'
import { PositionTableColumn, TransformedPosition } from '@/types'
import { isTradingbotSubaccountId } from '@/app/utils/helpers'

export function usePositionTransformer(
  positionList: ComputedRef<PositionV2[]>
) {
  const authZStore = useAuthZStore()
  const tokenStore = useTokenStore()
  const derivativeStore = useDerivativeStore()
  const gridStrategyStore = useGridStrategyStore()
  const sharedWalletStore = useSharedWalletStore()

  const rows = computed(() =>
    positionList.value.reduce((list, position) => {
      const market = derivativeStore.markets.find(
        (market) => market.marketId === position.marketId
      )

      if (!market) {
        return list
      }

      const margin = new BigNumberInWei(position.margin).toBase(
        market.quoteToken.decimals
      )

      const markPriceFromStream =
        derivativeStore.marketMarkPriceMap[market.marketId || '']

      const markPriceNotScaled = markPriceFromStream
        ? new BigNumberInBase(markPriceFromStream.price)
        : new BigNumberInWei(position.markPrice).toBase(
            market.quoteToken.decimals
          )

      const markPrice = calculateScaledMarkPrice({
        market,
        markPriceNotScaled
      })

      const price = new BigNumberInWei(position.entryPrice).toBase(
        market.quoteToken.decimals
      )

      const pnl = new BigNumberInBase(position.quantity)
        .times(markPrice.minus(price))
        .times(position.direction === TradeDirection.Long ? 1 : -1)

      const quantity = new BigNumberInBase(position.quantity)

      const percentagePnl = pnl.isNaN()
        ? ZERO_IN_BASE
        : new BigNumberInBase(pnl.dividedBy(margin).times(100))

      const liquidationPriceData = new BigNumberInWei(
        position.liquidationPrice
      ).toBase(market.quoteToken.decimals)

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
        .times(tokenStore.tokenUsdPrice(market.quoteToken) || 0)

      list.push({
        pnl,
        price,
        position,
        quantity,
        markPrice,
        percentagePnl,
        quantityInUsd,
        liquidationPrice,
        effectiveLeverage,
        hasActiveStrategy,
        isLimitOrderAuthorized,
        reduceOnlyCurrentOrders,
        isMarketOrderAuthorized,
        subaccountId: position.subaccountId,
        priceDecimals: market.priceDecimals,
        quantityDecimals: market.quantityDecimals,
        hasReduceOnlyOrders: !!reduceOnlyCurrentOrders.length,
        isTradingBotSubaccount: !!isTradingbotSubaccountId(
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

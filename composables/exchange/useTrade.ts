import { format } from 'date-fns'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { TradeExecutionType } from '@injectivelabs/ts-types'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { SharedUiSpotTrade, SharedUiDerivativeTrade } from '@shared/types'
import {
  DATE_TIME_DISPLAY,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '@/app/utils/constants'

export function useTrade(
  trade: Ref<SharedUiSpotTrade | SharedUiDerivativeTrade>,
  isSpot: Ref<boolean>
) {
  const spotStore = useSpotStore()
  const derivativeStore = useDerivativeStore()
  const { t } = useLang()

  const market = computed(() =>
    isSpot.value
      ? spotStore.markets.find((m) => m.marketId === trade.value.marketId)
      : derivativeStore.markets.find((m) => m.marketId === trade.value.marketId)
  )

  /** Unifying both spot and derivative to spot trade type */
  const tradeToSpotTrade = computed(() => {
    if (isSpot.value) {
      return trade.value as SharedUiSpotTrade
    }

    const derivativeTrade = trade.value as SharedUiDerivativeTrade

    return {
      ...derivativeTrade,
      price: derivativeTrade.executionPrice,
      quantity: derivativeTrade.executionQuantity,
      timestamp: derivativeTrade.executedAt
    } as SharedUiSpotTrade
  })

  const price = computed(() => {
    if (!market.value || !tradeToSpotTrade.value.price) {
      return ZERO_IN_BASE
    }

    return isSpot.value
      ? new BigNumberInBase(
          new BigNumberInBase(tradeToSpotTrade.value.price).toWei(
            market.value.baseToken.decimals - market.value.quoteToken.decimals
          )
        )
      : new BigNumberInWei(tradeToSpotTrade.value.price).toBase(
          market.value.quoteToken.decimals
        )
  })

  const quantity = computed(() => {
    if (!market.value || !tradeToSpotTrade.value.quantity) {
      return ZERO_IN_BASE
    }

    return isSpot.value
      ? new BigNumberInWei(tradeToSpotTrade.value.quantity).toBase(
          market.value.baseToken.decimals
        )
      : new BigNumberInBase(tradeToSpotTrade.value.quantity)
  })

  const total = computed(() => quantity.value.times(price.value))

  const priceDecimals = computed(() =>
    market.value
      ? market.value.priceDecimals
      : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
  )

  const quantityDecimals = computed(() =>
    market.value
      ? market.value.quantityDecimals
      : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
  )

  const time = computed(() => {
    if (!market.value || !trade.value.executedAt) {
      return ''
    }

    return format(trade.value.executedAt, DATE_TIME_DISPLAY)
  })

  const fee = computed(() => {
    if (!market.value || !trade.value.fee) {
      return ZERO_IN_BASE
    }

    return new BigNumberInWei(trade.value.fee).toBase(
      market.value.quoteToken.decimals
    )
  })

  const tradeExecutionType = computed<string>(() => {
    const derivativeTrade = trade.value as SharedUiDerivativeTrade

    if (!isSpot.value && derivativeTrade.isLiquidation) {
      return t('trade.liquidation')
    }

    switch (trade.value.tradeExecutionType) {
      case TradeExecutionType.LimitFill:
        return t('trade.limit')
      case TradeExecutionType.Market:
        return t('trade.market')
      case TradeExecutionType.LimitMatchRestingOrder:
        return t('trade.limit')
      case TradeExecutionType.LimitMatchNewOrder:
        return t('trade.limit')
      default:
        return t('trade.limit')
    }
  })

  return {
    fee,
    time,
    price,
    total,
    market,
    quantity,
    priceDecimals,
    quantityDecimals,
    tradeExecutionType
  }
}

export function useTradeWithUndefined(
  trade: Ref<SharedUiSpotTrade | SharedUiDerivativeTrade | undefined>,
  isSpot: Ref<boolean>
) {
  if (trade.value) {
    return useTrade(
      trade as Ref<SharedUiSpotTrade | SharedUiDerivativeTrade>,
      isSpot
    )
  }

  return {
    fee: undefined,
    time: undefined,
    price: undefined,
    total: undefined,
    market: undefined,
    quantity: undefined,
    priceDecimals: undefined,
    quantityDecimals: undefined,
    tradeExecutionType: undefined
  }
}

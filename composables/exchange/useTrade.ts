import { format } from 'date-fns'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { TradeDirection } from '@injectivelabs/sdk-ts'
import { TradeExecutionType } from '@injectivelabs/ts-types'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import {
  DATE_TIME_DISPLAY,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import type { SharedUiDerivativeTrade } from '@shared/types'

export function useTrade(trade: Ref<SharedUiDerivativeTrade>) {
  const derivativeStore = useDerivativeStore()
  const { t } = useLang()

  const market = computed(() =>
    derivativeStore.marketByIdOrSlug(trade.value.marketId)
  )

  const quantityDecimals = computed(() =>
    market.value
      ? market.value.quantityDecimals
      : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
  )

  const price = computed(() => {
    if (!market.value || !trade.value.executionPrice) {
      return ZERO_IN_BASE
    }

    return new BigNumberInWei(trade.value.executionPrice).toBase(
      market.value.quoteToken.decimals
    )
  })

  const quantity = computed(() => {
    if (!market.value || !trade.value.executionQuantity) {
      return ZERO_IN_BASE
    }

    return new BigNumberInWei(trade.value.executionQuantity).toBase(
      quantityDecimals.value
    )
  })

  const total = computed(() => quantity.value.times(price.value))

  const priceDecimals = computed(() =>
    market.value
      ? market.value.priceDecimals
      : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
  )

  const time = computed(() => {
    if (!trade.value.executedAt) {
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

  const pnl = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return sharedToBalanceInTokenInBase({
      value: trade.value.pnl,
      decimalPlaces: market.value.quoteToken.decimals
    })
  })

  const entryPrice = computed(() => {
    if (!market.value || quantity.value.isZero()) {
      return ZERO_IN_BASE
    }

    if (trade.value.tradeDirection === TradeDirection.Sell) {
      return new BigNumberInBase(
        price.value.minus(pnl.value.plus(fee.value).dividedBy(quantity.value))
      )
    }

    return new BigNumberInBase(
      price.value.plus(pnl.value.minus(fee.value).dividedBy(quantity.value))
    )
  })

  const percentagePnl = computed(() => {
    if (!market.value || pnl.value.isNaN()) {
      return ZERO_IN_BASE
    }

    const denominator = price.value.times(quantity.value).plus(fee.value.abs())
    if (denominator.isZero()) {
      return ZERO_IN_BASE
    }

    return new BigNumberInBase(pnl.value.dividedBy(denominator).times(100))
  })

  const tradeExecutionType = computed<string>(() => {
    if (trade.value.isLiquidation) {
      return t('trade.liquidation')
    }

    switch (trade.value.tradeExecutionType) {
      case TradeExecutionType.LimitMatchRestingOrder:
        return t('trade.limit')
      case TradeExecutionType.LimitMatchNewOrder:
        return t('trade.limit')
      case TradeExecutionType.LimitFill:
        return t('trade.limit')
      case TradeExecutionType.Market:
        return t('trade.market')
      default:
        return t('trade.limit')
    }
  })

  return {
    pnl,
    fee,
    time,
    price,
    total,
    market,
    quantity,
    entryPrice,
    percentagePnl,
    priceDecimals,
    quantityDecimals,
    tradeExecutionType
  }
}

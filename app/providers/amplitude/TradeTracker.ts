import { identify as amplitudeIdentify } from '@amplitude/analytics-browser'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { OrderSide } from '@injectivelabs/ts-types'
import BaseAmplitudeTracker from '@/app/providers/amplitude/BaseTracker'
import {
  AMPLITUDE_PLACE_ORDER_ATTEMPT_COUNT,
  AMPLITUDE_PLACE_ORDER_CONFIRM_COUNT
} from '@/app/utils/vendor'
import {
  AmplitudeEvent,
  TradeClickOrigin,
  OrderAttemptStatus,
  TradeExecutionType
} from '@/types'

class TradeTracker extends BaseAmplitudeTracker {
  navigateToTradePageTrackEvent({
    market,
    marketType,
    origin
  }: {
    market: string
    marketType: MarketType
    origin: TradeClickOrigin
  }) {
    const { user } = this
    const identify = this.getIdentify()

    if (!user || !identify) {
      return
    }

    amplitudeIdentify(identify)

    this.trackAmplitude(AmplitudeEvent.TradeClicked, {
      market,
      marketType,
      origin
    })
  }

  submitPlaceOrderAttemptTrackEvent({
    amount,
    market,
    marketType,
    orderType,
    postOnly,
    tradingType,
    leverage,
    triggerPrice,
    reduceOnly,
    limitPrice,
    slippageTolerance
  }: {
    amount: string
    market: string
    marketType: MarketType
    orderType: OrderSide
    postOnly?: boolean
    tradingType: TradeExecutionType
    leverage: string
    triggerPrice: string
    reduceOnly?: boolean
    limitPrice: string
    slippageTolerance: string
  }) {
    const { user } = this
    const identify = this.getIdentify()

    if (!user || !identify) {
      return
    }

    identify.add(AMPLITUDE_PLACE_ORDER_ATTEMPT_COUNT, 1)
    amplitudeIdentify(identify)

    this.trackAmplitude(AmplitudeEvent.PlaceOrderAttempt, {
      amount,
      market,
      marketType,
      orderType,
      postOnly,
      tradingType,
      leverage,
      triggerPrice,
      reduceOnly,
      limitPrice,
      slippageTolerance
    })
  }

  submitPlaceOrderConfirmTrackEvent({
    amount,
    market,
    marketType,
    orderSide,
    postOnly,
    tradingType,
    leverage,
    triggerPrice,
    reduceOnly,
    limitPrice,
    slippageTolerance,
    status,
    error
  }: {
    amount: string
    market: string
    marketType: MarketType
    orderSide: OrderSide
    postOnly: boolean
    tradingType: TradeExecutionType
    leverage?: string
    triggerPrice?: string
    reduceOnly?: boolean
    limitPrice: string
    slippageTolerance: string
    status: OrderAttemptStatus
    error?: string
  }) {
    const { user } = this
    const identify = this.getIdentify()

    if (!user || !identify) {
      return
    }

    identify.add(AMPLITUDE_PLACE_ORDER_CONFIRM_COUNT, 1)
    amplitudeIdentify(identify)

    this.trackAmplitude(AmplitudeEvent.PlaceOrderConfirm, {
      amount,
      market,
      marketType,
      orderSide,
      postOnly,
      tradingType,
      triggerPrice,
      leverage,
      limitPrice,
      reduceOnly,
      slippageTolerance,
      status,
      error
    })
  }
}

export const amplitudeTradeTracker = new TradeTracker()

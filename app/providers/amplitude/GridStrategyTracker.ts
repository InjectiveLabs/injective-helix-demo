import { identify as amplitudeIdentify } from '@amplitude/analytics-browser'
import BaseTracker from '@/app/providers/amplitude/BaseTracker'
import { AmplitudeEvent } from '@/types'
import {
  AMPLITUDE_CREATE_LIQUIDITY_COUNT,
  AMPLITUDE_CREATE_STRATEGY_COUNT,
  AMPLITUDE_REMOVE_LIQUIDITY_COUNT,
  AMPLITUDE_REMOVE_STRATEGY_COUNT
} from '@/app/utils/vendor'

class GridStrategyTracker extends BaseTracker {
  createStrategy(props: {
    error?: Error
    lowerPrice: string
    upperPrice: string
    gridsNumber: string
    amountQuote: string
    amountDenom?: string
    marketPrice: string
    market: string
    isLiquidity?: boolean
  }) {
    if (!props.error) {
      const user = this.getUser()
      const identify = this.getIdentify()

      if (!user || !identify) {
        return
      }

      identify.add(
        props.isLiquidity
          ? AMPLITUDE_CREATE_LIQUIDITY_COUNT
          : AMPLITUDE_CREATE_STRATEGY_COUNT,
        1
      )

      amplitudeIdentify(identify)
    }

    this.trackAmplitude(
      props.isLiquidity
        ? AmplitudeEvent.CreateLiquidityBot
        : AmplitudeEvent.CreateStrategy,
      props
    )
  }

  removeStrategy(props: {
    error?: Error
    market: string
    totalProfit: string
    duration: string
    isLiquidity?: boolean
  }) {
    if (!props.error) {
      const user = this.getUser()
      const identify = this.getIdentify()

      if (!user || !identify) {
        return
      }

      identify.add(
        props.isLiquidity
          ? AMPLITUDE_REMOVE_LIQUIDITY_COUNT
          : AMPLITUDE_REMOVE_STRATEGY_COUNT,
        1
      )

      amplitudeIdentify(identify)
    }

    this.trackAmplitude(
      props.isLiquidity
        ? AmplitudeEvent.RemoveLiquidityBot
        : AmplitudeEvent.RemoveStrategy,
      props
    )
  }
}

export const amplitudeGridStrategyTracker = new GridStrategyTracker()

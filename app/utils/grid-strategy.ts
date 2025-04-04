import { spotPriceToChainPriceToFixed } from '@injectivelabs/sdk-ts'

import { UiSpotMarket, SpotGridStrategyType } from '@/types'

/**
 * Interface defining the parameters for the calculateOptimalInvestment function.
 */
interface OptimalInvestmentParams {
  lowerPriceLevel: number
  upperPriceLevel: number
  currentPrice: number
  baseQuantity: number
  quoteQuantity: number
}

/**
 * Calculates optimal investment values for a grid trading strategy based on price levels, current price, and initial base and quote quantities.
 *
 * @param {OptimalInvestmentParams} params - An object containing the parameters for optimal investment calculation.
 * @returns {{ currentRatio: number, optimalRatio: number, optimalBaseAmount: number, optimalQuoteAmount: number, ratioDifference: number }}
 * An object containing:
 *   - currentRatio: The ratio of the current base asset value to the total current portfolio value.
 *   - optimalRatio: The optimal ratio based on the current price and price levels.
 *   - optimalBaseAmount: The calculated optimal amount of base asset to hold to achieve the optimal ratio.
 *   - optimalQuoteAmount: The calculated optimal amount of quote asset to hold to achieve the optimal ratio.
 *   - ratioDifference: The absolute difference between the optimal ratio and the current ratio.
 */
export const calculateOptimalInvestment = (params: OptimalInvestmentParams) => {
  const {
    lowerPriceLevel,
    upperPriceLevel,
    currentPrice,
    baseQuantity,
    quoteQuantity
  } = params

  const optimalRatio =
    (currentPrice - lowerPriceLevel) / (upperPriceLevel - lowerPriceLevel)

  const currentBaseValue = baseQuantity * currentPrice
  const totalCurrentValue = currentBaseValue + quoteQuantity
  const currentRatio =
    totalCurrentValue === 0 ? 0 : currentBaseValue / totalCurrentValue // Avoid division by zero

  const initialBaseValue = baseQuantity * currentPrice
  const totalInitialValue = initialBaseValue + quoteQuantity

  const optimalBaseValue = optimalRatio * totalInitialValue
  const optimalBaseAmount = optimalBaseValue / currentPrice

  const optimalQuoteAmount = (1 - optimalRatio) * totalInitialValue

  const ratioDifference = Math.abs(optimalRatio - currentRatio)

  return {
    currentRatio,
    optimalRatio,
    optimalBaseAmount,
    optimalQuoteAmount,
    ratioDifference
  }
}

export function getTrailingAndStrategyType(params: {
  trailingParams?: {
    lowerTrailingBound: string
    upperTrailingBound: string
  }
  strategyType: SpotGridStrategyType
  market: UiSpotMarket
}) {
  const { trailingParams, strategyType, market } = params
  if (
    [
      SpotGridStrategyType.TrailingArithmeticLP,
      SpotGridStrategyType.TrailingArithmetic
    ].includes(strategyType) &&
    trailingParams
  ) {
    return {
      strategyType,
      trailingParams: {
        lowerTrailingBound: spotPriceToChainPriceToFixed({
          value: trailingParams.lowerTrailingBound,
          baseDecimals: market.baseToken.decimals,
          quoteDecimals: market.quoteToken.decimals
        }),
        upperTrailingBound: spotPriceToChainPriceToFixed({
          value: trailingParams.upperTrailingBound,
          baseDecimals: market.baseToken.decimals,
          quoteDecimals: market.quoteToken.decimals
        })
      }
    }
  }

  return {
    strategyType: strategyType as
      | SpotGridStrategyType.Arithmetic
      | SpotGridStrategyType.ArithmeticLP
      | SpotGridStrategyType.Geometric
  }
}

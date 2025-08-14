import { spotPriceToChainPriceToFixed } from '@injectivelabs/sdk-ts'
import {
  SpotGridStrategyContractTypeParams,
  SpotGridStrategyType,
  UiSpotMarket
} from '@/types'

export const getSpotGridStrategyType = (params: {
  strategyType: SpotGridStrategyType
  trailingParams?: {
    upperTrailingBound: string
    lowerTrailingBound: string
  }
  market: UiSpotMarket
}) => {
  let strategyType: SpotGridStrategyContractTypeParams[keyof SpotGridStrategyContractTypeParams] =
    SpotGridStrategyType.Arithmetic

  if (params.strategyType === SpotGridStrategyType.Geometric) {
    strategyType = SpotGridStrategyType.Geometric
  }

  if (params.strategyType === SpotGridStrategyType.ArithmeticLP) {
    strategyType = SpotGridStrategyType.ArithmeticLP
  }

  if (
    params.strategyType === SpotGridStrategyType.TrailingArithmetic &&
    params.trailingParams
  ) {
    strategyType = {
      trailing_arithmetic: {
        upper_trailing_bound: spotPriceToChainPriceToFixed({
          value: params.trailingParams.upperTrailingBound,
          baseDecimals: params.market.baseToken.decimals,
          quoteDecimals: params.market.quoteToken.decimals
        }),
        lower_trailing_bound: spotPriceToChainPriceToFixed({
          value: params.trailingParams.lowerTrailingBound,
          baseDecimals: params.market.baseToken.decimals,
          quoteDecimals: params.market.quoteToken.decimals
        })
      }
    }
  }

  if (
    params.strategyType === SpotGridStrategyType.TrailingArithmeticLP &&
    params.trailingParams
  ) {
    strategyType = {
      trailing_arithmetic_l_p: {
        upper_trailing_bound: spotPriceToChainPriceToFixed({
          value: params.trailingParams.upperTrailingBound,
          baseDecimals: params.market.baseToken.decimals,
          quoteDecimals: params.market.quoteToken.decimals
        }),
        lower_trailing_bound: spotPriceToChainPriceToFixed({
          value: params.trailingParams.lowerTrailingBound,
          baseDecimals: params.market.baseToken.decimals,
          quoteDecimals: params.market.quoteToken.decimals
        })
      }
    }
  }

  return strategyType
}

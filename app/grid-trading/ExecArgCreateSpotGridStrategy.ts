import {
  ExitType,
  ExitConfig,
  SpotGridStrategyTypeParams,
  SpotGridStrategyContractTypeParams,
  SpotGridStrategyType
} from '@/types'

export type Params = SpotGridStrategyTypeParams & {
  subaccountId: string
  lowerBound: string
  upperBound: string
  levels: number
  slippage?: string
  stopLoss?: ExitConfig
  takeProfit?: ExitConfig
  exitType?: ExitType
}

export interface Data {
  subaccount_id: string
  bounds: [string, string]
  levels: number
  slippage?: string
  stop_loss?: {
    exit_type: ExitType
    exit_price: string
  }
  take_profit?: {
    exit_type: ExitType
    exit_price: string
  }
  exit_type?: ExitType
  strategy_type?: SpotGridStrategyContractTypeParams[keyof SpotGridStrategyContractTypeParams]
}

/**
 * @category Contract Exec Arguments
 */
export default class ExecArgCreateSpotGridStrategy {
  private params: Params

  constructor(params: Params) {
    this.params = params
  }

  static fromJSON(params: Params): ExecArgCreateSpotGridStrategy {
    return new ExecArgCreateSpotGridStrategy(params)
  }

  toData(): Data {
    const { params } = this

    let strategyType: SpotGridStrategyContractTypeParams[keyof SpotGridStrategyContractTypeParams] =
      SpotGridStrategyType.Arithmetic

    if (params.strategyType === SpotGridStrategyType.Geometric) {
      strategyType = SpotGridStrategyType.Geometric
    }

    if (params.strategyType === SpotGridStrategyType.ArithmeticLP) {
      strategyType = SpotGridStrategyType.ArithmeticLP
    }

    if (params.strategyType === SpotGridStrategyType.TrailingArithmetic) {
      strategyType = {
        trailing_arithmetic: {
          upper_trailing_bound: params.trailingParams.upperTrailingBound,
          lower_trailing_bound: params.trailingParams.lowerTrailingBound
        }
      }
    }

    if (params.strategyType === SpotGridStrategyType.TrailingArithmeticLP) {
      strategyType = {
        trailing_arithmetic_l_p: {
          upper_trailing_bound: params.trailingParams.upperTrailingBound,
          lower_trailing_bound: params.trailingParams.lowerTrailingBound
        }
      }
    }

    return {
      subaccount_id: params.subaccountId,
      levels: params.levels,
      bounds: [params.lowerBound, params.upperBound],
      slippage: params.slippage,
      exit_type: params.exitType,
      stop_loss: params.stopLoss
        ? {
            exit_type: params.stopLoss.exitType,
            exit_price: params.stopLoss.exitPrice
          }
        : undefined,
      take_profit: params.takeProfit
        ? {
            exit_type: params.takeProfit.exitType,
            exit_price: params.takeProfit.exitPrice
          }
        : undefined,
      strategy_type: strategyType
    }
  }

  toExecData(): Record<string, Data> {
    return {
      create_strategy: this.toData()
    }
  }
}

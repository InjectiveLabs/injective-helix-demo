import { FEE_RECIPIENT } from '../utils/constants'
import {
  ExitType,
  PerpetualGridStrategyContractTypeParams,
  PerpetualGridStrategyType,
  PerpetualGridStrategyTypeParams
} from '@/types'

export type Params = PerpetualGridStrategyTypeParams & {
  subaccountId: string
  lowerBound: string
  upperBound: string
  levels: number
  slippage?: string
  stopLoss?: string
  takeProfit?: string
  feeRecipient?: string
}

export interface Data {
  subaccount_id: string
  bounds: [string, string]
  slippage?: string
  stop_loss?: {
    exit_type: ExitType
    exit_price: string
  }
  take_profit?: {
    exit_type: ExitType
    exit_price: string
  }
  levels: number
  strategy_type: PerpetualGridStrategyContractTypeParams[keyof PerpetualGridStrategyContractTypeParams]
  fee_recipient?: string
}

/**
 * @category Contract Exec Arguments
 */
export default class ExecArgCreatePerpGridStrategy {
  private params: Params

  constructor(params: Params) {
    this.params = params
  }

  static fromJSON(params: Params): ExecArgCreatePerpGridStrategy {
    return new ExecArgCreatePerpGridStrategy(params)
  }

  toData(): Data {
    const { params } = this

    let strategyType: PerpetualGridStrategyContractTypeParams[keyof PerpetualGridStrategyContractTypeParams] =
      {
        perpetual: {
          margin_ratio: params.marginRatio
        }
      }

    if (params.strategyType === PerpetualGridStrategyType.PerpetualLong) {
      strategyType = {
        perpetual_long: {
          margin_ratio: params.marginRatio
        }
      }
    }

    if (params.strategyType === PerpetualGridStrategyType.PerpetualShort) {
      strategyType = {
        perpetual_short: {
          margin_ratio: params.marginRatio
        }
      }
    }

    return {
      subaccount_id: params.subaccountId,
      bounds: [params.lowerBound, params.upperBound],
      levels: params.levels,
      slippage: params.slippage,
      strategy_type: strategyType,
      stop_loss: params.stopLoss
        ? {
            exit_type: ExitType.Default,
            exit_price: params.stopLoss
          }
        : undefined,
      take_profit: params.takeProfit
        ? {
            exit_type: ExitType.Default,
            exit_price: params.takeProfit
          }
        : undefined,
      fee_recipient: params.feeRecipient ?? FEE_RECIPIENT
    }
  }

  toExecData(): Record<string, Data> {
    return {
      create_strategy: this.toData()
    }
  }
}

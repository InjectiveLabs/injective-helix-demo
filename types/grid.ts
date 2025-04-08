export enum ExitType {
  Default = 'default',
  Quote = 'quote',
  Base = 'base'
}

export enum SpotGridStrategyType {
  Arithmetic = 'arithmetic',
  ArithmeticLP = 'arithmetic_l_p',
  Geometric = 'geometric',
  TrailingArithmetic = 'trailing_arithmetic',
  TrailingArithmeticLP = 'trailing_arithmetic_l_p'
}

export enum PerpetualGridStrategyType {
  Perpetual = 'perpetual',
  PerpetualLong = 'perpetual_long',
  PerpetualShort = 'perpetual_short'
}

export type TrailingSpotParams = {
  lower_trailing_bound: string
  upper_trailing_bound: string
}

export type PerpetualParams = {
  margin_ratio: string
}

export type ExitConfig = {
  exitType: ExitType
  exitPrice: string
}

export type SpotGridStrategyContractTypeParams = {
  Arithmetic: SpotGridStrategyType.Arithmetic
  ArithmeticLP: SpotGridStrategyType.ArithmeticLP
  Geometric: SpotGridStrategyType.Geometric
  TrailingArithmetic: {
    [SpotGridStrategyType.TrailingArithmetic]: TrailingSpotParams
  }
  TrailingArithmeticLP: {
    [SpotGridStrategyType.TrailingArithmeticLP]: TrailingSpotParams
  }
}

export type PerpetualGridStrategyContractTypeParams = {
  Perpetual: {
    [PerpetualGridStrategyType.Perpetual]: PerpetualParams
  }
  PerpetualLong: {
    [PerpetualGridStrategyType.PerpetualLong]: PerpetualParams
  }
  PerpetualShort: {
    [PerpetualGridStrategyType.PerpetualShort]: PerpetualParams
  }
}

export type SpotGridStrategyTypeParams =
  | {
      strategyType: SpotGridStrategyType.Arithmetic
    }
  | {
      strategyType: SpotGridStrategyType.ArithmeticLP
    }
  | {
      strategyType: SpotGridStrategyType.Geometric
    }
  | {
      strategyType: SpotGridStrategyType.TrailingArithmetic
      trailingParams: {
        upperTrailingBound: string
        lowerTrailingBound: string
      }
    }
  | {
      strategyType: SpotGridStrategyType.TrailingArithmeticLP
      trailingParams: {
        upperTrailingBound: string
        lowerTrailingBound: string
      }
    }

export type PerpetualGridStrategyTypeParams = {
  strategyType: PerpetualGridStrategyType
  marginRatio: string
}

export type CreateSpotGridStrategyParams =
  | {
      strategyType: SpotGridStrategyType.Arithmetic
    }
  | {
      strategyType: SpotGridStrategyType.ArithmeticLP
    }
  | {
      strategyType: SpotGridStrategyType.Geometric
    }
  | {
      strategyType: SpotGridStrategyType.TrailingArithmetic
      trailingParams: {
        upperTrailingBound: string
        lowerTrailingBound: string
      }
    }
  | {
      strategyType: SpotGridStrategyType.TrailingArithmeticLP
      trailingParams: {
        upperTrailingBound: string
        lowerTrailingBound: string
      }
    }

export enum IndexerGridStrategyType {
  Geometric = 'geometric',
  Arithmetic = 'arithmetic',
  Perpetual = 'perpetual',
  ArithmeticLP = 'arithmetic_lp',
  PerpetualLong = 'perpetual_long',
  PerpetualShort = 'perpetual_short',
  TrailingArithmetic = 'trailing_arithmetic',
  TrailingArithmeticLP = 'trailing_arithmetic_lp'
}

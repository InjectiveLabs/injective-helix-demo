// mock types
export interface SummaryElcs {
  address: string
  total: string
  totalPercentage: string
  rewardsInInj: string
  rewardsInUsd: string
}

export interface SummaryEvcs {
  address: string
  total: string
  totalPercentage: string
  rewardsInInj: string
  rewardsInUsd: string
}

export interface RankingElcs {
  rank: string
  address: string
  buy: string
  sell: string
  elcs: string
  paramOne: string
  paramTwo: string
  paramThree: string
}

export interface RankingEvcs {
  rank: string
  subaccount: string
  elcs: string
  paramOne: string
  paramTwo: string
  paramThree: string
}

export interface DmmHistory {
  number: string
  timestamp: string
  score: string
  scorePercentage: string
}

export interface MarketRewardFactor {
  market: string
  elcs: string
  evcs: string
}

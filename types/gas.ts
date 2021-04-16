export interface GasInfo {
  gasPrice: string
  estimatedTimeMs: number
}

export interface EthGasStationResult {
  average: number
  fastestWait: number
  fastWait: number
  fast: number
  safeLowWait: number
  blockNum: number
  avgWait: number
  // eslint-disable-next-line camelcase
  block_time: number
  speed: number
  fastest: number
  safeLow: number
}

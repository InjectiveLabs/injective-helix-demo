export type JsonSlugMarketId = {
  slug: string
  marketId: string
}

export type JsonGridMarket = {
  slug: string
  contractAddress: string
}

export type JsonSwapRoute = {
  steps: string[]
  sourceDenom: string
  targetDenom: string
}

export type JsonSwapRouteRaw = {
  steps: string[]
  source_denom: string
  target_denom: string
}

export type JsonValidator = {
  image: string
  moniker: string
  identity: string
  operatorAddress: string
}

export type JsonChainUpgrade = {
  proposalId: number
  proposalMsg: string
  blockHeight: number
  disableMaintenance: boolean
}

export type JsonHelixCategory = {
  ai: JsonSlugMarketId[]
  rwa: JsonSlugMarketId[]
  defi: JsonSlugMarketId[]
  layer1: JsonSlugMarketId[]
  iAssets: JsonSlugMarketId[]
  trending: JsonSlugMarketId[]
  injective: JsonSlugMarketId[]
  newMarkets: JsonSlugMarketId[]
  deprecated: JsonSlugMarketId[]
}

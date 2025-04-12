import { LiquidityProvisionType } from './enums'

export type LiquidityProvisionMitoCard = {
  apy: number
  apyToShow: string
  tvl: number
  marketId: string
  vaultType: string
  type: LiquidityProvisionType
  contractAddress: string
  isPermissionless: boolean
}

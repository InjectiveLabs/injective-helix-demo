import { VaultType } from './enums'

export type LiquidityProvisionMitoCard = {
  apy: number
  apyToShow: string
  tvl: number
  marketId: string
  vaultType: string
  type: VaultType
  contractAddress: string
  isPermissionless: boolean
}

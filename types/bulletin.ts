import { BulletinType } from './enums'

export type BulletinMitoCard = {
  apy: number
  apyToShow: string
  tvl: number
  marketId: string
  vaultType: string
  type: BulletinType
  contractAddress: string
}

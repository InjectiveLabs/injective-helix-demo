import { BulletinType } from '@/types'

export default {
  bulletin: {
    title: 'Liquidity',
    description:
      'Earn sustainable yield through decentralized perpetual vaults and trading bots',
    TVL: 'TVL',
    APY: 'APY',
    type: {
      [BulletinType.MitoVault]: 'Mito - LP Vaults',
      [BulletinType.InjectiveStaking]: 'Injective - Staking',
      [BulletinType.HelixSpotGridBot]: 'Helix - Spot Grid Trading Bots'
    }
  }
}

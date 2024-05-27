import { LiquidityProvisionType } from '@/types'

export default {
  liquidityProvision: {
    title: 'Liquidity',
    description:
      'Earn sustainable yield through decentralized perpetual vaults and trading bots',
    TVL: 'TVL',
    APY: 'APY',
    type: {
      [LiquidityProvisionType.MitoVault]: 'Mito - LP Vaults',
      [LiquidityProvisionType.InjectiveStaking]: 'Injective - Staking',
      [LiquidityProvisionType.HelixSpotGridBot]:
        'Helix - Spot Grid Trading Bots'
    }
  }
}

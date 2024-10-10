import { LiquidityProvisionType } from '@/types'

export default {
  liquidityProvision: {
    title: 'Liquidity',
    description:
      'Earn sustainable yield through decentralized perpetual vaults and trading bots',
    TVL: 'TVL',
    APY: 'APY',

    item: {
      type: {
        [LiquidityProvisionType.MitoVault]: 'LP Vaults',
        [LiquidityProvisionType.InjectiveStaking]: 'Staking',
        [LiquidityProvisionType.HelixSpotGridBot]: 'Spot Grid Trading Bots'
      },
      description: {
        [LiquidityProvisionType.InjectiveStaking]: 'Native staking on Injective'
      }
    }
  }
}

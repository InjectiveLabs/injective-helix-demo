import { LiquidityProvisionType } from './../../../types'

export default {
  liquidityProvision: {
    title: 'Maximize Yield with Mito Vaults',
    description:
      'Supercharge your crypto holdings with Mito’s automated market making vaults. Start earning passive income today by providing liquidity to the leading projects in the Injective ecosystem.',
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
    },

    modal: {
      redirect:
        'Entering into vaults will redirect you from Helix to Mito where you can earn yield.',
      continueToMito: 'Continue to Mito'
    }
  }
}

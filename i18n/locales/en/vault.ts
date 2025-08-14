import { VaultType } from '@/types'

export default {
  vault: {
    TVL: 'TVL',
    APY: 'APY',
    title: 'Maximize Yield with Mito Vaults',
    description:
      'Supercharge your crypto holdings with Mito’s automated market making vaults. Start earning passive income today by providing liquidity to the leading projects in the Injective ecosystem.',

    item: {
      [VaultType.MitoVault]: 'LP Vaults',
      [VaultType.InjectiveStaking]: 'Staking',
      [VaultType.HelixSpotGridBot]: 'Spot Grid Trading Bots'
    },

    modal: {
      continueToMito: 'Continue to Mito',
      redirect:
        'Entering into vaults will redirect you from Helix to Mito where you can earn yield.'
    }
  }
}

import { I18nMessageFunction } from '@/types'

export default {
  airdrop: {
    airdrop: ({ named }: I18nMessageFunction) => `${named('asset')} Airdrop`,
    title:
      'You may be eligible for the airdrop if you have interacted with Helix on Injective. Check your eligibility below',
    check: 'Check',
    notEligible: 'You are not eligible for this airdrop.',
    congrats: ({ named }: I18nMessageFunction) =>
      `Congrats! You are eligible to claim ${named('amount')} ${named(
        'asset'
      )}.`,
    tweetMessage: ({ named }: I18nMessageFunction) =>
      `I have just received the first exclusive $${named(
        'asset'
      )} airdrop reserved for the most active @HelixApp_ users 🧬🚀

You can check your eligibility directly on the Helix app and claim your airdrop now! 
      
Powered by @injective`,
    claim: ({ named }: I18nMessageFunction) =>
      `Claim ${named('amount')} ${named('asset')}`,
    claimed: ({ interpolate, named }: I18nMessageFunction) =>
      interpolate([
        `You have successfully claimed `,
        named('amount'),
        ' ',
        named('asset')
      ]),
    alreadyClaimed: 'You have already claimed.',
    exploreDeFiOpportunities: 'Explore DeFi Opportunities',
    tradeOnHelix: 'Trade on Helix',
    automatedTradingVaultOnMito: 'Automated Trading Vault on Mito',
    tosHeader: ({ named }: I18nMessageFunction) =>
      `${named('asset')} Airdrop Terms of Use`,
    successNotification: ({ named }: I18nMessageFunction) =>
      `You have successfully claimed your ${named('asset')} Airdrop`,
    tweet: 'Tweet to enable claim',
    tweetId: 'Enter your tweet URL',
    verify: 'Verify',
    tweetVerified: 'Your Tweet has been verified!'
  }
}

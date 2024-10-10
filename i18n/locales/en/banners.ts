import { NoticeBanner } from '@/types'

export default {
  banners: {
    welcome: {
      title: 'Welcome to Injective!',
      subtitle: 'Just a few more steps and you’re good to go!',
      depositDescription:
        'Use Injective Bridge to transfer assets in your wallet.',
      transferDescription:
        'Transfer to your Injective Trading Account to start trading.',
      tradeDescription:
        'You are ready to Trade. Choose a market to get started!',
      showAddress: 'Show address',
      howItWorks: 'How it works',
      faq: 'F.A.Q'
    },

    kado: {
      title: 'Introducing Helix 2.0! Discover a whole new trading experience.',
      tryNow: 'Get started'
    },

    userFeedback: {
      loveFeedback: "We'd love to hear your feedback!",
      thankYouBeginning:
        'Thank you for using Helix. We are constantly improving our products for our users and we’d love to hear from you! The survey should take fewer than ',
      threeMinutes: '3 minutes ',
      thankYouEnd:
        'to complete and the information will help us know how to improve your future experience on Helix.',
      takeSurvey: 'Take the survey',
      notRightNow: 'Not right now'
    },

    newFeature: {
      close: 'Close',
      blogPost: 'blog post',
      tia: '$TIA',
      talis: '$TALIS',
      here: 'here',
      title: 'TALIS is now live on Helix!',
      description:
        'Helix is the first venue available to trade TALIS, the native token of Talis - the leading NFT marketplace in Cosmos. Explore ways to trade TALIS!',
      cta1: 'Go to TALIS/USDT',
      cta2: 'Swap TALIS'
    },

    [NoticeBanner.scheduledUpgradeJanuary2024]:
      'Scheduled maintenance at ~14:00 UTC, 11th January 2024 due to the Injective Volan mainnet upgrade. Find out more',
    [NoticeBanner.scheduledUpgradeAugust2024]:
      'Scheduled maintenance at ~15:00 UTC, 20th August 2024 due to the Injective mainnet upgrade. Find out more',

    footer: {
      operational: 'Operational',
      v2: ' Version 2.0'
    }
  }
}

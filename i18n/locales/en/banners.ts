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
      title: 'Introducing the TradFi Stocks Index!',
      description:
        'Trade the largest publicly traded stocks on-chain via one integrated index for the first time. Access TradFi 24/7 with the lowest fees and up to 25X leverage only on Helix. ',
      cta1: 'Trade TradFi'
    },

    [NoticeBanner.ScheduledUpgradeJanuary2024]:
      'Scheduled maintenance at ~14:00 UTC, 11th January 2024 due to the Injective Volan mainnet upgrade. Find out more',
    [NoticeBanner.ScheduledUpgradeAugust2024]:
      'Scheduled maintenance at ~15:00 UTC, 20th August 2024 due to the Injective mainnet upgrade. Find out more',

    footer: {
      operational: 'Operational',
      v2: ' Version 2.0'
    }
  }
}

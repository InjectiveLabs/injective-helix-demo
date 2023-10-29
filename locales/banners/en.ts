import { I18nMessageFunction } from '@/types'

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
      title: 'Onboard onto Injective instantly with fiat!',
      tryNow: 'Get started'
    },
    'banner-sheduled-upgrade-march':
      "A scheduled maintenance will take place around 16:00 UTC, 17 March 2023. Please note that you won't be able to place orders and manage positions during the downtime.",
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
      title: 'Celestia Pre-Launch Futures Trading Competition',
      description1:
        'Helix is excited to announce the launch of a special trading competition with 5,000 Celestia (TIA) tokens as rewards.',
      description2:
        'It is a volume trading competition in which the Top 100 volume traders will each receive 50 TIA tokens as the reward. The competition starts on October 26, 2023 at 2PM UTC, and ends on November 5, 2023 at 2PM UTC. The trading competition will offer users the opportunity to trade on Helix in order to not only win prizes exclusive to this competition, but also to enjoy market leading rebates, zero gas fees, lightning fast speeds and best-in-class security.',
      description3: ({ interpolate, named }: I18nMessageFunction) =>
        interpolate([
          'For more information, please visit our ',
          named('link'),
          '.'
        ])
    }
  }
}

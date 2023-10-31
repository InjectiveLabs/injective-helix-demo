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
      tia: '$TIA',
      here: 'here',
      title: ({ interpolate, named }: I18nMessageFunction) =>
        interpolate([
          'Celestia now live on Helix with 30,000 ',
          named('link'),
          ' in rewards up for grabs!'
        ]),
      description1: ({ interpolate, named }: I18nMessageFunction) =>
        interpolate([
          'Helix is the world’s first exchange to list TIA. To celebrate the addition of TIA/USDT Spot on Helix, Helix is giving away 30,000 TIA tokens to Helix traders. Enjoy gas free trading and the best rewards now! Read ',
          named('link'),
          ' for more details.'
        ]),
      cta1: 'Go to TIA/USDT',
      cta2: 'Swap TIA'
    }
  }
}

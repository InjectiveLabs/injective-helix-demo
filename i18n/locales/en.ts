import home from './en/home'
import swap from './en/swap'
import guild from './en/guild'
import toast from './en/toast'
import trade from './en/trade'
import vault from './en/vault'
import market from './en/market'
import wallet from './en/wallet'
import points from './en/points'
import banners from './en/banners'
import referral from './en/referral'
import lpRewards from './en/lpRewards'
import portfolio from './en/portfolio'
import navigation from './en/navigation'
import tradingBots from './en/tradingBots'
import leaderboard from './en/leaderboard'
import maintenance from './en/maintenance'
import feeDiscounts from './en/feeDiscounts'
import tradeAndEarn from './en/tradeAndEarn'
import institutional from './en/institutional'
import { TimeDuration } from '@/types'

export default {
  ...home,
  ...swap,
  ...guild,
  ...toast,
  ...trade,
  ...vault,
  ...market,
  ...wallet,
  ...points,
  ...banners,
  ...referral,
  ...lpRewards,
  ...portfolio,
  ...navigation,
  ...tradingBots,
  ...leaderboard,
  ...maintenance,
  ...feeDiscounts,
  ...tradeAndEarn,
  ...institutional,

  common: {
    or: 'or',
    and: 'and',
    pnl: 'PnL',
    max: 'Max',
    docs: 'docs',
    back: 'Back',
    base: 'Base',
    copy: 'Copy',
    here: 'here',
    link: 'link',
    view: 'View',
    total: 'Total',
    quote: 'Quote',
    value: 'Value',
    close: 'Close',
    ready: 'Ready',
    claim: 'Claim',
    amount: 'Amount',
    active: 'Active',
    enable: 'Enable',
    submit: 'Submit',
    search: 'Search',
    cancel: 'Cancel',
    sortBy: 'Sort By',
    connect: 'Connect',
    details: 'Details',
    runtime: 'Runtime',
    claimed: 'Claimed',
    deposit: 'Deposit',
    confirm: 'Confirm',
    download: 'Download',
    disabled: 'Disabled',
    inactive: 'inactive',
    transfer: 'Transfer',
    withdraw: 'Withdraw',
    tradeNow: 'Trade Now',
    ascending: 'Ascending',
    learnMore: 'Learn more',
    descending: 'Descending',
    tradingDocs: 'Trading Docs',
    unauthorized: 'Unauthorized',
    baseAndQuote: 'Base and Quote',
    sortDirection: 'Sort Direction',
    dontShowAgain: "Don't Show Again",
    showMoreContext: 'Show more context',
    acknowledgeTerms: 'Acknowledge Terms',
    pagination: 'From {from} to {to} total {totalCount}',

    [TimeDuration.Day]: 'Day',
    [TimeDuration.Hour]: 'Hour',
    [TimeDuration.Minute]: 'Minute',
    [TimeDuration.Second]: 'Second',

    account: {
      main: 'Main',
      subaccount: 'Subaccount',
      mainSubaccount: 'Main Subaccount',
      subaccountId: 'Subaccount {subaccountId}',
      subaccountTransfer: 'Subaccount Transfer',
      noAssetToTransfer:
        "You don't have any assets to transfer from this subaccount."
    },

    modal: {
      terms: {
        privacyPolicy: 'Privacy Policy',
        termsAndCondition: 'Terms and Conditions',
        title: 'In addition, you hereby represent, warrant, and agree that:',
        acknowledge_1:
          'You are not a person or company who is a resident of, is located, incorporated, or has a registered agent in, the United States of America (with respect to trading perpetual contracts), the UK (unless you are an Investment Professional), or a Restricted Territory (as defined in the Helix Terms and Conditions).',
        acknowledge_2:
          'You will not now or in the future access this site or use helixapp.com while located in the United States of America (with respect to trading perpetual contracts), the UK (unless you are an Investment Professional), or a Restricted Territory (as defined in the Helix Terms and Conditions).',
        acknowledge_3:
          'You are not using, and will not in the future use, a virtual private network or other means to mask your physical location from a Restricted Territory.',
        acknowledge_4:
          'You are lawfully permitted to access this site and trade on helixapp.com under the laws of the jurisdiction in which you reside and are located.',
        acknowledge_5:
          'You understand the risks associated with using leverage, entering into perpetual contracts, and trading in digital assets.',
        disclaimerNote:
          'By connecting to a wallet, you acknowledge that you have read, that you agree to, and that you are bound by both the Helix {0} and the Injective Labs {1}.'
      },

      postOnlyMode: {
        title: 'Post Only Mode!',
        description:
          'Please note that for the 2000 blocks (~30 minutes) immediately after the Injective Volan mainnet upgrade, only limit orders can be placed during this period.'
      },

      geoRestricted: {
        cta: 'Got it',
        title: 'Helix not available in your region.',
        description:
          "We're unable to offer Helix in your region due to regulatory requirements. Our team is actively working to expand our service area while ensuring full compliance with local laws. We appreciate your interest and hope to welcome you to our growing global community soon. If you have any open positions, you may close them from the portfolio page."
      },

      devMode: {
        connect: 'Connect',
        enterPrivateKey: 'Enter your private key',
        connectWithPrivateKey: 'Connect with private key',
        enterInjectiveAddress: 'Enter your injective address'
      },

      ninjaPass: {
        later: 'Later',
        verifyNow: 'Verify now',
        congratulations: 'Congratulations! 🎉',
        title: "You've won an exclusive Ninja Pass 🥷",
        description:
          'It will serve as your gateway into exclusive Injective events, products, giveaways and many more surprises.'
      },

      onboarding: {
        buyInjWithCard: 'Buy INJ with Card',
        injectiveBridge: 'Injective Bridge',
        processing: 'Processing your transfer',
        closeAndContinue: 'Close and continue',
        success: 'Your transaction has been confirmed',
        depositUsdtFromEthereum: 'Deposit USDT from Ethereum',
        processingMessage:
          'Processing is taking more than usual. Please wait for a while.',
        processingMessageInfo:
          'Your transfer is being processed in the background, and you can safely close this modal. You can check the bridged amount on the balances page or by viewing your bridge history on the '
      }
    }
  },

  notFound404: {
    title: 'Page Not Found',
    backToHome: 'Back to home page',
    description: 'The page you are looking for does not exist.'
  }
}

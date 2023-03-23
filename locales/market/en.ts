import { I18nMessageFunction } from '@/types'

export default {
  markets: {
    title: 'Markets',
    whatsNew: "What's new",
    topGainer: 'Top Gainer',
    topVolume: 'Top Volume',
    category: 'Category',
    market: 'Market',
    emptyHeader: 'No markets found',
    emptyDescription: 'Try another search term or you can propose some!',
    emptyHeaderFavorites: 'No favorited markets yet.',
    emptyDescriptionFavorites: 'Your starred markets will be shown here.',
    poweredBy: 'Powered by',
    vol: 'Vol',
    quote: 'Quote',
    expiredRecently: 'Expired in last 24 hours',
    settledAt: 'Settled at',
    airdrop: 'Airdrop',
    showLowVol: 'Show low Vol.'
  },

  marketPage: {
    assets: 'Assets',
    asseuitsNote: '',
    balances: 'Balances',
    portfolio: 'Portfolio',
    account: 'Account',
    noTradingBalance: 'Deposit to start trading!',
    noChainBalance: 'We cannot find any token balances for your address.',
    noChainBalanceNote: 'Use Injective Bridge to transfer assets to Injective.',
    noTradingAccountBalance:
      'Transfer to your Injective Trading Account to start trading on Helix.',
    startTrading: 'Start Trading!',
    availableBalance: ({ named }: I18nMessageFunction) =>
      `Available ${named('asset')}`,
    transferToTrade: 'Transfer to trade',
    wallet: 'Wallet'
  }
}

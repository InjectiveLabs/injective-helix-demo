import { I18nMessageFunction } from '@/types'

export default {
  connect: {
    wallet: 'Wallet',
    walletAddress: 'Wallet Address',
    address: 'Address',
    close: 'Close',
    connect: 'Connect',
    connectWallet: 'Connect Wallet',
    connectToWallet: 'Connect to Wallet',
    connectUsingBrowser: 'Connect using browser wallet',
    connectUsingHardware: 'Connect using hardware wallet',
    connectUsingLedger: 'Connect using Ledger',
    connectUsingLedgerNote:
      'Note: To ensure smooth process while connecting your Ledger Hardware Wallet, please ensure you are running the on latest Chrome version, have your Ledger device connected, unlocked and your Ethereum app open.',
    connectUsingWalletConnect:
      'Connect using WalletConnect (mobile and desktop wallets)',
    addressCopied: 'Address Copied',
    copiedAddress: 'Address copied to your clipboard',
    getAddresses: 'Get addresses',
    getMoreAddresses: 'Get more addresses',
    getAddressNote: 'We are getting your addresses, please wait ...',
    derivationPath: 'Derivation Path',
    download: 'download',
    ledger: 'Ledger',
    ledgerLive: 'Ledger Live',
    ledgerLegacy: 'Ledger Legacy',
    logout: 'Logout',
    metamask: 'Metamask',
    walletConnect: 'WalletConnect',
    open: 'open',
    keplr: 'Keplr',
    connectUsingKeplr: 'Connect using Keplr',
    selectAddressToConnect: 'Select address to connect',
    selectDerivationPath: 'Select Derivation Path',
    successfullyConnected: 'Successfully Connected',
    switchToEthereumAddress: 'Switch to Ethereum Address',
    switchToInjectiveAddress: 'Switch to Injective Address',
    trezorConnectionNote:
      "Note: At this point there is no support for Trezor - please don't use Trezor (including Metamask's Trezor integration) as it might cause your funds being stuck on Injective.",
    pleaseConnectToYourWallet:
      'Please connect to your wallet to see more details',
    pleaseConnectToYourWalletCta:
      'Please connect to your wallet to start trading on Injective!',
    highlyExperimental: 'Highly Experimental!',

    connectUsingTorus: 'One-click login with',
    torus: 'Torus',
    trezor: 'Trezor',
    Trezor: 'Trezor',
    connectUsingTrezor: 'Connect using Trezor',
    connectUsingTrezorNote:
      'Note: To ensure smooth process while connecting your Trezor Hardware Wallet, please ensure you are running the on latest Chrome version, have your Trezor device connected and unlocked.',

    leap: 'Leap',
    cosmostation: 'Cosmostation'
  },

  memo: {
    memo: 'Memo',
    memoTooltip:
      'Please check if the destination address requires a memo. If memo is required, incorrect input will result in loss of your funds.',
    memoPlaceholder: 'Your memo'
  },

  insufficientGas: {
    insufficientGas: 'Insufficient Funds for Gas',
    insufficientGasNoteDescription: ({
      interpolate,
      named
    }: I18nMessageFunction) =>
      interpolate([
        'Get a small amount of free INJ from a ',
        named('faucetLink'),
        ' or top up your Injective Wallet on ',
        named('hubLink'),
        ' to ensure sufficient fee coverage for future transactions.'
      ]),
    communityDrivenFaucet: 'community driven faucet',
    getFreeInj: 'Get Free INJ',
    injectiveHub: 'Injective Hub',
    tradingFormNote: 'Insufficient INJ to pay for gas/transaction fees.'
  }
}

import { Wallet } from '@injectivelabs/wallet-base'

export default {
  connect: {
    wallet: 'Wallet',
    walletAddress: 'Wallet Address',
    address: 'Address',
    close: 'Close',
    connect: 'Connect',
    beta: 'Beta',
    signUp: 'Sign Up',
    login: 'Log In',
    getStarted: 'Get Started',
    getStartedDescription:
      'Connect your wallet or sign up with SSO to get started.',
    showMoreWallets: 'Show more wallets',
    showLessWallets: 'Show fewer wallets',
    deposit: 'Deposit',
    connectedAs: 'Connected as',
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
    trezor: 'Trezor',
    trezorBip44: 'Trezor Bip44',
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
    Trezor: 'Trezor',
    connectUsingTrezor: 'Connect using Trezor',
    connectUsingTrezorNote:
      'Note: To ensure smooth process while connecting your Trezor Hardware Wallet, please ensure you are running the on latest Chrome version, have your Trezor device connected and unlocked.',

    qrTitle: 'Deposit only INJ network assets to this address',

    magic: {
      google: {
        cta: 'Sign up with Google'
      },
      email: {
        placeholder: 'Your email address',
        cta: 'Continue'
      }
    },

    option: {
      [Wallet.Leap]: 'Leap',
      [Wallet.Keplr]: 'Keplr',
      [Wallet.Ninji]: 'Ninji',
      [Wallet.Ledger]: 'Ledger',
      [Wallet.Phantom]: 'Phantom',
      [Wallet.Metamask]: 'Metamask',
      [Wallet.TrezorBip32]: 'Trezor',
      [Wallet.TrezorBip44]: 'Trezor Bip44',
      [Wallet.OkxWallet]: 'OKX Wallet',
      [Wallet.BitGet]: 'Bitget Wallet',
      [Wallet.TrustWallet]: 'Trust Wallet',
      [Wallet.Cosmostation]: 'Cosmostation',
      [Wallet.WalletConnect]: 'Wallet Connect'
    }
  }
}

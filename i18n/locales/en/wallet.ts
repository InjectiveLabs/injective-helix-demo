import { Wallet } from '@injectivelabs/wallet-base'

export default {
  connect: {
    beta: 'Beta',
    wallet: 'Wallet',
    trezor: 'Trezor',
    address: 'Address',
    ledgerLive: 'Ledger Live',
    trezorBip44: 'Trezor Bip44',
    getAddresses: 'Get addresses',
    ledgerLegacy: 'Ledger Legacy',
    walletAddress: 'Wallet Address',
    connectWallet: 'Connect Wallet',
    derivationPath: 'Derivation Path',
    showMoreWallets: 'Show more wallets',
    showLessWallets: 'Show fewer wallets',
    injectiveAddress: 'Injective Address',
    getMoreAddresses: 'Get more addresses',
    selectDerivationPath: 'Select Derivation Path',
    connectUsingBrowser: 'Connect using browser wallet',
    selectAddressToConnect: 'Select address to connect',
    connectUsingHardware: 'Connect using hardware wallet',
    connectDeprecatedSSO: 'Connect using deprecated login',
    qrTitle: 'Deposit only INJ network assets to this address',
    otpDescription: 'Enter your one time code to verify your email',
    getAddressNote: 'We are getting your addresses, please wait ...',
    pleaseConnectToYourWallet:
      'Please connect to your wallet to see more details',
    pleaseConnectToYourWalletCta:
      'Please connect to your wallet to start trading on Injective!',
    connectUsingTrezorNote:
      'Note: To ensure smooth process while connecting your Trezor Hardware Wallet, please ensure you are running the on latest Chrome version, have your Trezor device connected and unlocked.',
    connectUsingLedgerNote:
      'Note: To ensure smooth process while connecting your Ledger Hardware Wallet, please ensure you are running the on latest Chrome version, have your Ledger device connected, unlocked and your Ethereum app open.',

    sso: {
      google: {
        cta: 'Sign in with Google'
      },
      email: {
        cta: 'Continue',
        placeholder: 'Your email address'
      }
    },

    deprecate: {
      cta: 'Migrate Wallet',
      title: 'Action required: migrate your wallet',
      description:
        'We are upgrading our wallet provider and your current one is being deprecated. We strongly encourage you to migrate your wallet by following this',
      migrateDescription:
        'We’ve upgraded how you sign in to make things faster, simpler, and more secure. To continue using Helix, please connect your updated wallet to move your assets over. It only takes a moment, and your funds are always safe.'
    },

    option: {
      [Wallet.Leap]: 'Leap',
      [Wallet.Keplr]: 'Keplr',
      [Wallet.Ninji]: 'Ninji',
      [Wallet.Ledger]: 'Ledger',
      [Wallet.Phantom]: 'Phantom',
      [Wallet.Rainbow]: 'Rainbow',
      [Wallet.Metamask]: 'Metamask',
      [Wallet.TrezorBip32]: 'Trezor',
      [Wallet.TrezorBip44]: 'Trezor Bip44',
      [Wallet.OkxWallet]: 'OKX Wallet',
      [Wallet.BitGet]: 'Bitget Wallet',
      [Wallet.Magic]: '"Legacy login"',
      [Wallet.TrustWallet]: 'Trust Wallet',
      [Wallet.Cosmostation]: 'Cosmostation',
      [Wallet.WalletConnect]: 'Wallet Connect'
    }
  }
}

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
    injectiveAddress: 'Injective Address',
    connectUsingBrowser: 'Connect using browser wallet',
    connectUsingHardware: 'Connect using hardware wallet',
    connectUsingLedger: 'Connect using Ledger',
    connectUsingLedgerNote:
      'Note: To ensure smooth process while connecting your Ledger Hardware Wallet, please ensure you are running the on latest Chrome version, have your Ledger device connected, unlocked and your Ethereum app open.',
    connectUsingWalletConnect:
      'Connect using WalletConnect (mobile and desktop wallets)',
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
  },

  authZ: {
    title: 'Access Control Management',
    description:
      'Grant other wallet address full/partial permissions to make trades on their behalf',
    grantee: 'Grantee',
    grantees: 'Grantees',
    granters: 'Granters',
    granteeAddress: 'Grantee Address',
    grantedFunctions: 'Granted Functions',
    actions: 'Actions',
    granter: 'Granter',
    authZAs: 'AuthZ as {address}',
    addNewGrantee: 'Add new grantee address',
    addGranteeAddress: 'Add grantee address',
    connectMobile: 'Connect Mobile Device',
    noGrants: 'No grants found',
    viewGrantedFunctions: 'View granted functions',
    connected: 'Connected',
    connectAs: 'Connect as',
    revoke: 'Revoke',
    revokeAll: 'Revoke All'
  },

  autoSign: {
    title: 'Auto Sign',
    durationDescription: 'Auto sign is active for 3 days.',
    pageTitle: 'Auto-Sign: Approve Transactions Automatically',
    content1: {
      a: 'Once enabled, you can use Helix without signing',
      b: 'each transaction for up to 3 days.'
    },
    content2: {
      title: 'You can use it for:',
      a: 'Opening/closing positions (spot & perpetual pairs)',
      b: 'Setting limit orders',
      c: 'Creating Take-Profit / Stop-Loss (TP/SL) orders'
    },
    content3: {
      title: 'Note:',
      a: 'Swap and trading bots are not included.',
      b: 'For security, the session automatically expires after 3 days.',
      c: 'You can start a new session anytime after it ends.'
    },
    howItWorks:
      'During the enabled duration (3 days), you can perform many operations on Helix (including opening/closing positions on spot and perp trading pairs, setting limit orders, and creating TP/SL parameters) without signing additional transactions. Interactions with the swap feature or trading bots are not included. For security reasons, the auto sign function will expire after the 3 days time frame, at which point you may choose to initiate a new session.',
    expiredToast: {
      title: 'Auto sign session has expired',
      settings: 'Settings',
      description: 'You can start a new session from {settings}'
    },
    disconnect: 'Disconnect Auto-Sign'
  }
}

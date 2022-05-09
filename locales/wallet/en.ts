export default {
  connect: {
    wallet: 'Wallet',
    address: 'Address',
    close: 'Close',
    connect: 'Connect',
    connectToWallet: 'Connect to Wallet',
    connectUsingBrowser: 'Connect using browser wallet',
    connectUsingHardware: 'Connect using hardware wallet',
    connectUsingLedger: 'Connect using Ledger',
    connectUsingLedgerNote:
      'Note: To ensure smooth process while connecting your Ledger Hardware Wallet, please ensure you are running the on latest Chrome version, have your Ledger device connected, unlocked and your Ethereum app open.',
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

    connectUsingTorus: 'Connect using Torus',
    torus: 'Torus'
  },

  memo: {
    memo: 'Memo',
    memoTooltip:
      'Please check if the destination address requires a memo. If memo is required, incorrect input will result in loss of your funds.',
    memoPlaceholder: 'Your memo'
  },

  referralModal: {
    title: 'New user onboarding',
    header: 'Welcome to Injective Pro!',
    connectTheWallet: 'Connect the wallet',
    confirm: 'Confirm',
    usingReferCode: "You're using refer code",
    enterCode: 'Enter code',
    alreadyReferredToast: 'This address has already been referred'
  },

  insufficientGas: {
    insufficientGas: 'Insufficient Funds for Gas',
    insufficientGasNote:
      'When using Keplr wallet to connect to the exchange you are covering the gas fees and it seems you do not have enough INJ balance in your Injective Wallet.',
    insufficientGasNote2:
      'Please top up your Injective Wallet with sufficient INJ on <a href="{hubUrl}" target="_blank" class="text-primary-500">Injective Hub</a> to ensure sufficient fee coverage for future transactions.',
    tradingFormNote: 'Insufficient INJ in your wallet for transaction fees.'
  }
}

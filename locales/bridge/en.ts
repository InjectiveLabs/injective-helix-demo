import { I18nMessageFunction } from '@/types'

export default {
  bridge: {
    ibc: 'IBC',
    inj: 'inj',
    amount: 'Amount',
    waived: 'Waived',
    gasFee: 'Gas fee',
    confirm: 'Confirm',
    balance: 'Balance',
    wormhole: 'Wormhole',
    available: 'Available',
    allowance: 'Allowance',
    bridgeFee: 'Bridge Fee',
    depositNow: 'Deposit Now',
    transferNow: 'Transfer Now',
    withdrawNow: 'Withdraw Now',
    editAddress: 'Edit Address',
    setAllowance: 'Set Allowance',
    useMyAddress: 'Use My Address',
    tradingAccount: 'Trading Account',
    transferAmount: 'Transfer Amount',
    seeOnExplorer: 'View on explorer',
    resetAllowance: 'Reset Allowance',
    mainSubaccount: 'Main Subaccount',
    injectiveWallet: 'Injective Wallet',
    trackTransaction: 'Track Transaction',
    transferOnChain: 'Transfer on Injective',
    authZNotSupported: 'AuthZ not supported',
    destinationAddress: 'Destination Address',
    insufficientAmount: 'Insufficient Amount',
    depositToInjective: 'Deposit to Injective',
    selectOriginNetwork: 'Select origin network',
    transactionConfirmed: 'Transaction Confirmed',
    confirmTransaction: 'Confirm your transaction',
    withdrawFromInjective: 'Withdraw from Injective',
    selectDestinationNetwork: 'Select destination network',
    keplrConnectedForEthereum: 'Please connect with Ethereum Wallet',
    selectTokenAndAmount: 'Select a token and input an amount',
    connectFundingWallet: 'Connect funding wallet to continue',
    reviewTransaction: 'Please review your transaction details',
    successfullySetAllowance: 'Token allowance set successfully',
    transferToSubaccountSuccess: 'Subaccount transfer successful',
    metamaskConnectedForCosmos: 'Please connect with Cosmos wallet',
    transferFromToTradingAccount: 'Transfer to/from trading account',
    depositToTradingAccountSuccess: 'Deposit to trading account successful',
    depositToInjectiveSuccess: 'Your transaction is successfully submitted!',
    withdrawFromInjectiveSuccess: 'Your transaction is successfully submitted!',
    withdrawFromTradingAccountSuccess:
      'Withdraw from trading account successful',
    withdrawToInjectiveAddressSuccess:
      'Withdraw to Injective account successfully',
    noAssetToTransfer:
      "You don't have any assets to transfer from this subaccount.",
    transferTitleTooltip:
      'To trade on Injective, funds must be in the Trading Account.',
    withdrawFromEthereumNote:
      'Note: It should take around 10 minutes for your transfer to appear after your transaction has been confirmed on Ethereum.',
    defaultNote:
      'Note: It should take up to 10 seconds for your transfer to appear after your transaction has been confirmed on Injective',
    allowanceNote:
      'Note: When using latest Metamask extension, click on the "Use Default" button when setting allowance. Otherwise you\'d need to set your allowance again (paying gas fees one more time) if you want to transfer a different amount.',
    allowanceNoteReset:
      'Note: When using latest Metamask extension, click on the "Use Default" button when setting allowance. Otherwise you\'d need to revoke the allowance first and then set it again (paying gas fees 2 times) if you want to transfer a different amount.',
    transfersNote: ({ named }: I18nMessageFunction) =>
      `${named(
        'network'
      )} transfers are not supported on the lite version of the Bridge. Please use the fully fledged Bridge on the Injective Hub.`,
    enterAddress: ({ named }: I18nMessageFunction) =>
      `Your ${named('networkName')} address`,
    withdrawFromInjectiveNote: ({ named }: I18nMessageFunction) =>
      `Note: There is a Bridge fee of ≈${named('fee')} ${named(
        'asset'
      )} included in the transaction`,
    setAllowanceFor: ({ named }: I18nMessageFunction) =>
      `Set allowance for ${named('asset')}`,
    setAllowanceForBridging: ({ named }: I18nMessageFunction) =>
      `Set allowance for transferring ${named(
        'asset'
      )} through the Injective Bridge.`,
    subaccountId: ({ named }: I18nMessageFunction) =>
      `Subaccount ${named('subaccountId')}`,

    ninjiNotSupported: 'Ninji not supported for IBC transfers.'
  }
}

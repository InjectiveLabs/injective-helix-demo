import { I18nMessageFunction } from '@/types'

export default {
  bridge: {
    transferFromToTradingAccount: 'Transfer to/from trading account',
    injectiveWallet: 'Injective Wallet',
    tradingAccount: 'Trading Account',
    selectTokenAndAmount: 'Select a token and input an amount',
    transferNow: 'Transfer Now',
    depositNow: 'Deposit Now',
    withdrawNow: 'Withdraw Now',
    available: 'Available',
    withdrawFromInjective: 'Withdraw from Injective',
    depositToInjective: 'Deposit to Injective',
    selectOriginNetwork: 'Select origin network',
    selectDestinationNetwork: 'Select destination network',
    transferOnChain: 'Transfer on Injective',
    ibc: 'IBC',
    wormhole: 'Wormhole',
    transfersNote: ({ named }: I18nMessageFunction) =>
      `${named(
        'network'
      )} transfers are not supported on the lite version of the Bridge. Please use the fully fledged Bridge on the Injective Hub.`,
    confirmTransaction: 'Confirm your transaction',
    reviewTransaction: 'Please review your transaction details',
    amount: 'Amount',
    injAddress: 'Destination Address',
    bridgeFee: 'Bridge Fee',
    transferAmount: 'Transfer Amount',
    confirm: 'Confirm',
    waived: 'Waived',
    gasFee: 'Gas fee',
    insufficientINJForGas: 'Insufficient INJ For Gas',
    insufficientAmount: 'Insufficient Amount',
    trackTransaction: 'Track Transaction',
    transactionConfirmed: 'Transaction Confirmed',
    depositToTradingAccountSuccess: 'Deposit to trading account successful',
    withdrawToInjectiveAddressSuccess:
      'Withdraw to Injective account successfully',
    withdrawFromTradingAccountSuccess:
      'Withdraw from trading account successful',
    depositToInjectiveSuccess: 'Your transaction is successfully submitted!',
    withdrawFromInjectiveSuccess: 'Your transaction is successfully submitted!',
    seeOnExplorer: 'View on explorer',

    transferTitleTooltip:
      'To trade on Injective, funds must be in the Trading Account.',
    withdrawFromInjectiveNote: ({ named }: I18nMessageFunction) =>
      `Note: There is a Bridge fee of ≈${named('fee')} ${named(
        'asset'
      )} included in the transaction`,
    withdrawFromEthereumNote:
      'Note: It should take around 10 minutes for your transfer to appear after your transaction has been confirmed on Ethereum.',
    defaultNote:
      'Note: It should take up to 10 seconds for your transfer to appear after your transaction has been confirmed on Injective',

    allowance: 'Allowance',
    setAllowance: 'Set Allowance',
    resetAllowance: 'Reset Allowance',
    setAllowanceFor: ({ named }: I18nMessageFunction) =>
      `Set allowance for ${named('asset')}`,
    successfullySetAllowance: 'Token allowance set successfully',
    keplrConnectedForEthereum: 'Please connect with Metamask',
    balance: 'Balance',
    allowanceNote:
      'Note: When using latest Metamask extension, click on the "Use Default" button when setting allowance. Otherwise you\'d need to set your allowance again (paying gas fees one more time) if you want to transfer a different amount.',
    allowanceNoteReset:
      'Note: When using latest Metamask extension, click on the "Use Default" button when setting allowance. Otherwise you\'d need to revoke the allowance first and then set it again (paying gas fees 2 times) if you want to transfer a different amount.',
    setAllowanceForBridging: ({ named }: I18nMessageFunction) =>
      `Set allowance for transferring ${named(
        'asset'
      )} through the Injective Bridge.`,

    mainSubaccount: 'Main Subaccount',
    subaccountId: ({ named }: I18nMessageFunction) =>
      `Subaccount ${named('subaccountId')}`,
    transferToSubaccountSuccess: 'Subaccount transfer successful',
    noAssetToTransfer:
      "You don't have any assets to transfer from this subaccount."
  }
}

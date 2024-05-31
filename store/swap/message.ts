import {
  msgsOrMsgExecMsgs,
  ExecArgSwapMinOutput,
  ExecArgSwapExactOutput,
  MsgExecuteContractCompat,
  spotQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { msgBroadcaster } from '@shared/WalletService'
import { backupPromiseCall } from '@/app/utils/async'
import { SWAP_CONTRACT_ADDRESS } from '@/app/utils/constants'
import { convertCw20ToBankBalanceForSwap } from '@/app/utils/market'
import { SwapForm, SwapFormField, TokenAndPriceAndDecimals } from '@/types'

const fetchBalances = (
  {
    shouldFetchCw20Balances
  }: {
    shouldFetchCw20Balances: boolean
  } = { shouldFetchCw20Balances: false }
) => {
  const accountStore = useAccountStore()

  return backupPromiseCall(() =>
    Promise.all([
      accountStore.fetchAccountPortfolioBalances(),
      ...(shouldFetchCw20Balances ? [accountStore.fetchCw20Balances()] : [])
    ])
  )
}

export const submitAtomicOrder = async ({
  formValues,
  inputToken,
  outputToken,
  minimumOutput
}: {
  formValues: SwapForm
  inputToken: TokenAndPriceAndDecimals
  outputToken: TokenAndPriceAndDecimals
  minimumOutput: string
}) => {
  const appStore = useAppStore()
  const accountStore = useAccountStore()
  const walletStore = useWalletStore()

  if (
    !walletStore.isUserWalletConnected ||
    !walletStore.defaultSubaccountId ||
    !minimumOutput
  ) {
    return
  }

  await appStore.queue()
  await appStore.validateGeoIp()
  await walletStore.validate()

  const activeInputAmount = formValues[SwapFormField.InputAmount]

  const execArgs = ExecArgSwapMinOutput.fromJSON({
    targetDenom: outputToken.denom,
    minOutputQuantity: spotQuantityToChainQuantityToFixed({
      value: minimumOutput,
      baseDecimals: outputToken.token.decimals
    })
  })

  const cw20ConvertMessage = convertCw20ToBankBalanceForSwap({
    token: inputToken.token,
    quantity: activeInputAmount,
    injectiveAddress: walletStore.injectiveAddress,
    bankBalancesMap: accountStore.balancesMap,
    cw20BalancesMap: accountStore.cw20BalancesMap
  })

  const swapMessage = MsgExecuteContractCompat.fromJSON({
    contractAddress: SWAP_CONTRACT_ADDRESS,
    sender: walletStore.injectiveAddress,
    funds: {
      denom: inputToken.denom,
      amount: spotQuantityToChainQuantityToFixed({
        value: activeInputAmount,
        baseDecimals: inputToken.token.decimals
      })
    },
    execArgs
  })

  const message = cw20ConvertMessage
    ? [cw20ConvertMessage, swapMessage]
    : swapMessage

  let actualMessage

  if (walletStore.isAuthzWalletConnected) {
    actualMessage = msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
  } else if (walletStore.autoSign && walletStore.isAutoSignEnabled) {
    actualMessage = msgsOrMsgExecMsgs(
      message,
      walletStore.autoSign.injectiveAddress
    )
  } else {
    actualMessage = message
  }

  const { txHash } = await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress:
      walletStore.autoSign && walletStore.isAutoSignEnabled
        ? walletStore.autoSign.injectiveAddress
        : walletStore.injectiveAddress
  })

  await fetchBalances({ shouldFetchCw20Balances: !!cw20ConvertMessage })

  return txHash
}

export const submitAtomicOrderExactOutput = async ({
  formValues,
  inputToken,
  outputToken,
  maximumInput
}: {
  formValues: SwapForm
  inputToken: TokenAndPriceAndDecimals
  outputToken: TokenAndPriceAndDecimals
  maximumInput: string
}) => {
  const appStore = useAppStore()
  const accountStore = useAccountStore()
  const walletStore = useWalletStore()

  if (
    !walletStore.isUserWalletConnected ||
    !walletStore.defaultSubaccountId ||
    !maximumInput
  ) {
    return
  }

  await appStore.queue()
  await appStore.validateGeoIp()
  await walletStore.validate()

  const activeOutputAmount = formValues[SwapFormField.OutputAmount]

  const cw20ConvertMessage = convertCw20ToBankBalanceForSwap({
    token: inputToken.token,
    quantity: maximumInput,
    injectiveAddress: walletStore.injectiveAddress,
    bankBalancesMap: accountStore.balancesMap,
    cw20BalancesMap: accountStore.cw20BalancesMap
  })

  const execArgs = ExecArgSwapExactOutput.fromJSON({
    targetDenom: outputToken.denom,
    targetOutputQuantity: spotQuantityToChainQuantityToFixed({
      value: activeOutputAmount,
      baseDecimals: outputToken.token.decimals
    })
  })

  const swapMessage = MsgExecuteContractCompat.fromJSON({
    contractAddress: SWAP_CONTRACT_ADDRESS,
    sender: walletStore.injectiveAddress,
    funds: {
      denom: inputToken.denom,
      amount: spotQuantityToChainQuantityToFixed({
        value: maximumInput,
        baseDecimals: inputToken.token.decimals
      })
    },
    execArgs
  })

  const message = cw20ConvertMessage
    ? [cw20ConvertMessage, swapMessage]
    : swapMessage

  let actualMessage

  if (walletStore.isAuthzWalletConnected) {
    actualMessage = msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
  } else if (walletStore.autoSign && walletStore.isAutoSignEnabled) {
    actualMessage = msgsOrMsgExecMsgs(
      message,
      walletStore.autoSign.injectiveAddress
    )
  } else {
    actualMessage = message
  }

  const { txHash } = await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress:
      walletStore.autoSign && walletStore.isAutoSignEnabled
        ? walletStore.autoSign.injectiveAddress
        : walletStore.injectiveAddress
  })

  await fetchBalances({ shouldFetchCw20Balances: !!cw20ConvertMessage })

  return txHash
}

import {
  msgsOrMsgExecMsgs,
  ExecArgSwapMinOutput,
  ExecArgSwapExactOutput,
  MsgExecuteContractCompat,
  spotQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { msgBroadcaster } from '@shared/WalletService'
import { SWAP_CONTRACT_ADDRESS } from '@/app/utils/constants'
import { SwapForm, SwapFormField, TokenAndPriceAndDecimals } from '@/types'
import { convertCw20ToBankBalanceForSwap } from '~/app/utils/market'
import { backupPromiseCall } from '@/app/utils/async'

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

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  const { txHash } = await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
  })

  if (cw20ConvertMessage) {
    await backupPromiseCall(() => accountStore.fetchCw20Balances())
  }

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

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  const { txHash } = await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
  })

  if (cw20ConvertMessage) {
    await backupPromiseCall(() => accountStore.fetchCw20Balances())
  }

  return txHash
}

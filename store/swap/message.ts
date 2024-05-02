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

  const message = MsgExecuteContractCompat.fromJSON({
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

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  const { txHash } = await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
  })

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

  const execArgs = ExecArgSwapExactOutput.fromJSON({
    targetDenom: outputToken.denom,
    targetOutputQuantity: spotQuantityToChainQuantityToFixed({
      value: activeOutputAmount,
      baseDecimals: outputToken.token.decimals
    })
  })

  const message = MsgExecuteContractCompat.fromJSON({
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

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  const { txHash } = await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
  })

  return txHash
}

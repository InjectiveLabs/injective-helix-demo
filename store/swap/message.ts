import {
  ExecArgSwapMinOutput,
  ExecArgSwapExactOutput,
  MsgExecuteContractCompat,
  spotQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { SwapForm, SwapFormField, TokenAndPriceAndDecimals } from '@/types'
import { msgBroadcastClient } from '@/app/Services'
import { SWAP_CONTRACT_ADDRESS } from '@/app/utils/constants'

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

  const {
    address,
    validate,
    isUserWalletConnected,
    injectiveAddress,
    defaultSubaccountId
  } = useWalletStore()

  if (!isUserWalletConnected || !defaultSubaccountId || !minimumOutput) {
    return
  }

  await appStore.queue()
  await validate()

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
    sender: injectiveAddress,
    funds: {
      denom: inputToken.denom,
      amount: spotQuantityToChainQuantityToFixed({
        value: activeInputAmount,
        baseDecimals: inputToken.token.decimals
      })
    },
    execArgs
  })

  const { txHash } = await msgBroadcastClient.broadcastWithFeeDelegation({
    address,
    msgs: message
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

  const {
    address,
    validate,
    injectiveAddress,
    defaultSubaccountId,
    isUserWalletConnected
  } = useWalletStore()

  if (!isUserWalletConnected || !defaultSubaccountId || !maximumInput) {
    return
  }

  await appStore.queue()
  await validate()

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
    sender: injectiveAddress,
    funds: {
      denom: inputToken.denom,
      amount: spotQuantityToChainQuantityToFixed({
        value: maximumInput,
        baseDecimals: inputToken.token.decimals
      })
    },
    execArgs
  })

  const { txHash } = await msgBroadcastClient.broadcastWithFeeDelegation({
    address,
    msgs: message
  })

  return txHash
}

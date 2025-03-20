import {
  ExecArgSwapMinOutput,
  ExecArgSwapExactOutput,
  MsgExecuteContractCompat,
  spotQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { backupPromiseCall } from '@/app/utils/async'
import { SWAP_CONTRACT_ADDRESS } from '@/app/utils/constants'
import { prepareOrderMessages } from '@/app/utils/market'
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
  const walletStore = useWalletStore()
  const sharedWalletStore = useSharedWalletStore()

  if (
    !sharedWalletStore.isUserConnected ||
    !sharedWalletStore.defaultSubaccountId ||
    !minimumOutput
  ) {
    return
  }

  await walletStore.validate()
  await appStore.validateGeoIpBasedOnSpotAction({
    baseDenom: inputToken.denom,
    quoteDenom: outputToken.denom
  })

  const activeInputAmount = formValues[SwapFormField.InputAmount]

  const execArgs = ExecArgSwapMinOutput.fromJSON({
    targetDenom: outputToken.denom,
    minOutputQuantity: spotQuantityToChainQuantityToFixed({
      value: minimumOutput,
      baseDecimals: outputToken.token.decimals
    })
  })

  const cw20ConvertMessage = prepareOrderMessages({
    denom: inputToken.token.denom,
    amount: new BigNumberInBase(activeInputAmount)
      .toWei(inputToken.token.decimals)
      .toFixed()
  })

  const swapMessage = MsgExecuteContractCompat.fromJSON({
    contractAddress: SWAP_CONTRACT_ADDRESS,
    sender: sharedWalletStore.injectiveAddress,
    funds: {
      denom: inputToken.denom,
      amount: spotQuantityToChainQuantityToFixed({
        value: activeInputAmount,
        baseDecimals: inputToken.token.decimals
      })
    },
    execArgs
  })

  const response = await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [...cw20ConvertMessage, swapMessage]
  })

  await fetchBalances({
    shouldFetchCw20Balances: cw20ConvertMessage.length > 0
  })

  if (response) {
    return response.txHash
  }
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
  const sharedWalletStore = useSharedWalletStore()

  if (
    !maximumInput ||
    !sharedWalletStore.isUserConnected ||
    !sharedWalletStore.defaultSubaccountId
  ) {
    return
  }

  await walletStore.validate()
  await appStore.validateGeoIpBasedOnSpotAction({
    baseDenom: inputToken.denom,
    quoteDenom: outputToken.denom
  })

  const activeOutputAmount = formValues[SwapFormField.OutputAmount]

  const cw20ConvertMessage = prepareOrderMessages({
    denom: inputToken.token.denom,
    amount: new BigNumberInBase(maximumInput)
      .toWei(inputToken.token.decimals)
      .toFixed()
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
    sender: sharedWalletStore.injectiveAddress,
    funds: {
      denom: inputToken.denom,
      amount: spotQuantityToChainQuantityToFixed({
        value: maximumInput,
        baseDecimals: inputToken.token.decimals
      })
    },
    execArgs
  })

  const response = await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [...cw20ConvertMessage, swapMessage]
  })

  await fetchBalances({
    shouldFetchCw20Balances: cw20ConvertMessage.length > 0
  })

  if (response) {
    return response.txHash
  }
}

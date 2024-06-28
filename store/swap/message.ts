import {
  ExecArgSwapMinOutput,
  ExecArgSwapExactOutput,
  MsgExecuteContractCompat,
  spotQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
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
  const accountStore = useAccountStore()
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
    injectiveAddress: sharedWalletStore.injectiveAddress,
    bankBalancesMap: accountStore.balancesMap,
    cw20BalancesMap: accountStore.cw20BalancesMap
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

  const messages = cw20ConvertMessage
    ? [cw20ConvertMessage, swapMessage]
    : swapMessage

  const response = await sharedWalletStore.broadcastWithFeeDelegation({
    messages
  })

  await fetchBalances({ shouldFetchCw20Balances: !!cw20ConvertMessage })

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
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (
    !maximumInput ||
    !sharedWalletStore.isUserConnected ||
    !sharedWalletStore.defaultSubaccountId
  ) {
    return
  }

  await walletStore.validate()

  const activeOutputAmount = formValues[SwapFormField.OutputAmount]

  const cw20ConvertMessage = convertCw20ToBankBalanceForSwap({
    token: inputToken.token,
    quantity: maximumInput,
    injectiveAddress: sharedWalletStore.injectiveAddress,
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

  const messages = cw20ConvertMessage
    ? [cw20ConvertMessage, swapMessage]
    : swapMessage

  const response = await sharedWalletStore.broadcastWithFeeDelegation({
    messages
  })

  await fetchBalances({ shouldFetchCw20Balances: !!cw20ConvertMessage })

  if (response) {
    return response.txHash
  }
}

import { sharedBackupPromiseCall } from '@shared/utils/async'
import { sharedToBalanceInWei } from '@shared/utils/formatter'
import {
  ExecArgSwapMinOutput,
  ExecArgSwapExactOutput,
  MsgExecuteContractCompat,
  spotQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { SWAP_CONTRACT_ADDRESS } from '@/app/utils/constants'
import { prepareNeptuneWithdrawMessage } from '@/app/utils/msgs'
import { SwapFormField } from '@/types'
import type { SwapForm, TokenAndPriceAndDecimals } from '@/types'

const fetchBalances = (
  {
    shouldFetchCw20Balances
  }: {
    shouldFetchCw20Balances: boolean
  } = { shouldFetchCw20Balances: false }
) => {
  const accountStore = useAccountStore()

  return sharedBackupPromiseCall(() =>
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
  minimumOutput: string
  inputToken: TokenAndPriceAndDecimals
  outputToken: TokenAndPriceAndDecimals
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

  const cw20Messages = prepareNeptuneWithdrawMessage({
    denom: inputToken.token.denom,
    amount: sharedToBalanceInWei({
      value: activeInputAmount,
      decimalPlaces: inputToken.token.decimals
    }).toFixed()
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
    messages: [...cw20Messages, swapMessage]
  })

  await fetchBalances({
    shouldFetchCw20Balances: cw20Messages.length > 0
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
  maximumInput: string
  inputToken: TokenAndPriceAndDecimals
  outputToken: TokenAndPriceAndDecimals
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

  const cw20Messages = prepareNeptuneWithdrawMessage({
    denom: inputToken.token.denom,
    amount: sharedToBalanceInWei({
      value: maximumInput,
      decimalPlaces: inputToken.token.decimals
    }).toFixed()
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
    messages: [...cw20Messages, swapMessage]
  })

  await fetchBalances({
    shouldFetchCw20Balances: cw20Messages.length > 0
  })

  if (response) {
    return response.txHash
  }
}

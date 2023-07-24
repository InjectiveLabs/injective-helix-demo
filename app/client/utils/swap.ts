import { BigNumberInBase } from '@injectivelabs/utils'
import { indexerRestExplorerApi } from '@/app/Services'
import { toBalanceInToken } from '@/app/utils/formatters'

enum SwapError {
  NotEnoughLiquidity = 'Not enough liquidity to fulfill order'
}

type Attribute = {
  key: string
  value: string
}[]

export const mapErrorToMessage = (error: string) => {
  const errorMap = {
    [SwapError.NotEnoughLiquidity]: 'Not enough liquidity. Try smaller amount.'
  }

  const mappedError = Object.values(SwapError).find((swapErrorValue) =>
    error.includes(swapErrorValue)
  )

  return errorMap[mappedError as SwapError] || 'Please try again'
}

const getAttributeValue = (attributes: Attribute, key: string) =>
  attributes.find((attribute) => attribute.key === key)?.value

export const getSwapAmountAndTokenFromTxHash = async (
  txHash: string
): Promise<Record<string, string> | undefined> => {
  const tokenStore = useTokenStore()

  /* Wait 3 seconds for indexer to process the tsx */
  await new Promise((resolve) => setTimeout(resolve, 3000))

  const tx = await indexerRestExplorerApi.fetchTransaction(txHash)

  if (!tx || !tx.logs || !tx.logs.length) {
    return
  }

  const { events } = tx.logs[0]

  const event = events.find(
    (event) => event.type === 'wasm-atomic_swap_execution'
  )

  if (!event) {
    return
  }

  const inputAmount = getAttributeValue(event.attributes, 'swap_input_amount')
  const outputAmount = getAttributeValue(event.attributes, 'swap_final_amount')
  const inputDenom = getAttributeValue(event.attributes, 'swap_input_denom')
  const outputDenom = getAttributeValue(event.attributes, 'swap_final_denom')

  if (!inputAmount || !outputAmount || !inputDenom || !outputDenom) {
    return
  }

  const inputToken = tokenStore.tokens.find(({ denom }) => denom === inputDenom)
  const outputToken = tokenStore.tokens.find(
    ({ denom }) => denom === outputDenom
  )

  if (!inputToken || !outputToken) {
    return
  }

  const inputAmountFormatted = new BigNumberInBase(
    toBalanceInToken({
      value: inputAmount,
      decimalPlaces: inputToken?.decimals || 18
    })
  ).toFormat(3)

  const outputAmountFormatted = new BigNumberInBase(
    toBalanceInToken({
      value: outputAmount,
      decimalPlaces: outputToken?.decimals || 18
    })
  ).toFormat(3)

  return {
    outputTokenSymbol: outputToken.symbol,
    inputAmount: inputAmountFormatted,
    inputTokenSymbol: inputToken.symbol,
    outputAmount: outputAmountFormatted
  }
}

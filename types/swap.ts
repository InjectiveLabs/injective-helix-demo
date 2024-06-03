import { SharedBalanceWithTokenAndPrice } from '@shared/types'

export interface TokenAndPriceAndDecimals
  extends Omit<SharedBalanceWithTokenAndPrice, 'balance'> {
  quantityDecimals: number
  tensMultiplier?: number
}

export enum SwapFormField {
  InputDenom = 'inputDenom',
  InputAmount = 'inputAmount',
  OutputDenom = 'outputDenom',
  OutputAmount = 'outputAmount',
  Slippage = 'slippage',
  QueryError = 'queryError'
}

export type SwapForm = {
  [SwapFormField.InputDenom]: string
  [SwapFormField.InputAmount]: string
  [SwapFormField.OutputDenom]: string
  [SwapFormField.OutputAmount]: string
  [SwapFormField.Slippage]: string
  [SwapFormField.QueryError]: string
}

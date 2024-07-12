import { SharedBalanceWithTokenAndPrice } from '@shared/types'

export interface TokenAndPriceAndDecimals
  extends Omit<SharedBalanceWithTokenAndPrice, 'balance'> {
  quantityDecimals: number
  tensMultiplier?: number
}

export enum SwapFormField {
  Slippage = 'slippage',
  InputDenom = 'inputDenom',
  QueryError = 'queryError',
  InputAmount = 'inputAmount',
  OutputDenom = 'outputDenom',
  OutputAmount = 'outputAmount',
  InputLastTradedPrice = 'inputLastTradedPrice',
  OutputLastTradedPrice = 'outputLastTradedPrice'
}

export type SwapForm = {
  [SwapFormField.Slippage]: string
  [SwapFormField.InputDenom]: string
  [SwapFormField.QueryError]: string
  [SwapFormField.InputAmount]: string
  [SwapFormField.OutputDenom]: string
  [SwapFormField.OutputAmount]: string
  [SwapFormField.InputLastTradedPrice]: string
  [SwapFormField.OutputLastTradedPrice]: string
}

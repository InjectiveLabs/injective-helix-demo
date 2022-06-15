import { TradeError } from '~/types'

export enum ConvertTradeErrorLinkType {
  None = 0,
  Portfolio = 1,
  Hub = 2
}

export interface ConvertForm {
  amount: string
  toAmount: string
  price: string
  slippageTolerance: string
}

export interface ConvertTradeError extends TradeError {
  linkType: ConvertTradeErrorLinkType
}

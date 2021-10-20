import { Token } from './token'
import { TokenWithBalance } from '.'

export type BankBalances = Record<string, string>
export type BankBalanceWithTokenMetaData = {
  balance: string
  denom: string
  token: Token
}

export type BankBalanceWithTokenMetaDataAndBalance = {
  balance: string
  denom: string
  token: TokenWithBalance
}

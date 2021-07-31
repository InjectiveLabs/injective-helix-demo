import { Token } from './token'

export type BankBalances = Record<string, string>
export type BankBalanceWithTokenMetaData = {
  balance: string
  denom: string
  token: Token
}

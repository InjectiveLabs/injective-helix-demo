import { BigNumberInBase } from '@injectivelabs/utils'
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

export interface BankBalanceWithTokenMetaDataAndBalanceWithUsdBalance
  extends BankBalanceWithTokenMetaDataAndBalance {
  balanceInUsd: BigNumberInBase
}

export type SubaccountBalanceWithTokenMetaData = {
  availableBalance: string
  totalBalance: string
  denom: string
  token: TokenWithBalance
}

export interface SubaccountBalanceWithTokenMetaDataWithUsdBalance
  extends SubaccountBalanceWithTokenMetaData {
  balanceInUsd: BigNumberInBase
}

export interface IbcBankBalanceWithTokenMetaData
  extends BankBalanceWithTokenMetaData {
  baseDenom: string
  channelId: string
}

export interface UiSubaccountBalance {
  totalBalance: string
  availableBalance: string
  denom: string
}

export interface UiSubaccountBalanceWithToken
  extends Omit<
    UiSubaccountBalance,
    'totalBalance' | 'denom' | 'availableBalance'
  > {
  totalBalance: string // BigNumberInWei
  availableBalance: string // BigNumberInWei
}

export interface UiSubaccount {
  subaccountId: string
  balances: UiSubaccountBalance[]
}

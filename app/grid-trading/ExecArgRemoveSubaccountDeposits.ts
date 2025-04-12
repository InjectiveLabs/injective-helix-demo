export interface Params {
  subaccountIds: string[]
}

export interface Data {
  subaccounts: string[]
}

/**
 * @category Contract Exec Arguments
 */
export default class ExecArgRemoveSubaccountDeposits {
  private params: Params

  constructor(params: Params) {
    this.params = params
  }

  static fromJSON(params: Params): ExecArgRemoveSubaccountDeposits {
    return new ExecArgRemoveSubaccountDeposits(params)
  }

  toData(): Data {
    const { params } = this

    return {
      subaccounts: params.subaccountIds
    }
  }

  toExecData(): Record<string, Data> {
    return {
      remove_subaccount_deposits: this.toData()
    }
  }
}

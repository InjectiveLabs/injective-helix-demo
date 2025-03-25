export interface Params {
  subaccountId?: string
}

export interface Data {
  subaccount_id?: string
}

/**
 * @category Contract Exec Arguments
 */
export default class ExecArgCloseGridStrategy {
  private params: Params

  constructor(params: Params) {
    this.params = params
  }

  static fromJSON(params: Params): ExecArgCloseGridStrategy {
    return new ExecArgCloseGridStrategy(params)
  }

  toData(): Data {
    const { params } = this

    return {
      subaccount_id: params.subaccountId
    }
  }

  toExecData(): Record<string, Data> {
    return {
      close_strategy: this.toData()
    }
  }
}

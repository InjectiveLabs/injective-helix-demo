/* eslint-disable camelcase */
export interface ExplorerApiResponse<T> {
  data: {
    paging: any
    data: T
  }
}

export interface TransactionFromExplorerApiResponse {
  id: string
  block_number: number
  block_timestamp: string
  signatures: Array<{
    pubkey: string
    address: string
    signature: string
    sequence: number
  }>
  tx_type: string
  hash: string
  code: number
  data?: Uint8Array | string
  info: string
  gas_wanted: number
  gas_used: number
  events: Array<any> // TODO
  codespace: string
  messages: Array<{ value: any; type: string }> // TODO
}

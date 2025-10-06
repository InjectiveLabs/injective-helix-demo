import type {
  Coin,
  BlockWithTxs,
  ContractTransaction,
  ExplorerTransaction
} from '@injectivelabs/sdk-ts'

export type SharedEventAttribute = {
  key: string
  value: string
}

export interface UIMessageTemplateSummary {
  type: string
  summary: string[]
}

export interface UiExplorerBlockWithTxs extends Omit<BlockWithTxs, 'txs'> {
  txs: UiExplorerTransaction[]
}

export interface UiExplorerTransaction extends ExplorerTransaction {
  types: string[]
  coinSpent: Coin[]
  coinReceived: Coin[]
  templateSummaries: UIMessageTemplateSummary[]
}

export interface UiContractTransaction extends ContractTransaction {
  hash: string
  types: string[]
  coinSpent: Coin[]
  blockNumber: number
  coinReceived: Coin[]
  blockTimestamp: number
}

import {
  NEPTUNE_USDT_CW20_CONTRACT,
  ContractExecutionCompatAuthz
} from '@injectivelabs/sdk-ts'
import { MsgType } from '@injectivelabs/ts-types'
import { usdtToken } from '@shared/data/token'
import { SWAP_CONTRACT_ADDRESS } from '../utils/constants'

export const TRADING_MESSAGES = [
  MsgType.MsgCancelSpotOrder,
  MsgType.MsgLiquidatePosition,
  MsgType.MsgBatchUpdateOrders,
  MsgType.MsgCreateSpotLimitOrder,
  MsgType.MsgCreateSpotMarketOrder,
  MsgType.MsgCancelDerivativeOrder,
  MsgType.MsgBatchCancelSpotOrders,
  MsgType.MsgExecuteContractCompat,
  MsgType.MsgIncreasePositionMargin,
  MsgType.MsgCreateDerivativeLimitOrder,
  MsgType.MsgBatchCreateSpotLimitOrders,
  MsgType.MsgCreateDerivativeMarketOrder,
  MsgType.MsgBatchCancelDerivativeOrders,
  MsgType.MsgBatchCreateDerivativeLimitOrders
]

const limit: ContractExecutionCompatAuthz['params']['limit'] = {
  maxCalls: 1000,
  amounts: [{ amount: '1000000000000000000', denom: usdtToken.denom }]
}

export const CONTRACT_EXECUTION_COMPAT_AUTHZ = [
  ContractExecutionCompatAuthz.fromJSON({
    contract: SWAP_CONTRACT_ADDRESS,
    // filter: { acceptedMessagesKeys: ['swap_exact_output', 'swap_min_output'] },
    limit
  }),

  ContractExecutionCompatAuthz.fromJSON({
    contract: NEPTUNE_USDT_CW20_CONTRACT,
    // filter: { acceptedMessagesKeys: ['send', 'lend'] },
    limit
  })
]

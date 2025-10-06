import { MsgType } from '@injectivelabs/ts-types'
import { eventLogsSummaryMap } from './messageEvents'
import { contractEventSummaryMap } from './contractEvents'
import { USDT_DENOM } from '../../utils/constant'
import { contractMsgTypeMap } from './../../utils/explorer'
import { getNetworkFromAddress } from './../../utils/network'
import { sharedToBalanceInToken } from './../../utils/formatter'
import { EventMessageType } from './../../types'
import type { Coin, Message, EventLog } from '@injectivelabs/sdk-ts'

const AUCTION_POOL_SUBACCOUNT_ID =
  '0x1111111111111111111111111111111111111111111111111111111111111111'

const exchangeMsgSummaryMap: Partial<
  Record<
    MsgType,
    (value: Message, logs: EventLog[], injectiveAddress?: string) => string[]
  >
> = {
  [MsgType.MsgWithdraw]: (value: Message, _) => {
    const {
      sender,
      amount: { denom, amount },
      subaccount_id: subaccountId
    } = value.message

    return [
      `{{account:${sender}}} withdrew {{denom:${denom}-${amount}}} from subaccount {{ellipsis:${subaccountId}}}`
    ]
  },

  [MsgType.MsgInstantSpotMarketLaunch]: (value: Message, _) => {
    const { sender, ticker } = value.message

    return [`{{account:${sender}}} instant launched the ${ticker}`]
  },

  [MsgType.MsgCreateSpotMarketOrder]: (value: Message, _) => {
    const { sender, order } = value.message

    const { quantity } = order.order_info
    const { market_id: marketId } = order

    return [
      `{{account:${sender}}} created a MARKET ${order.order_type} order for {{spotQuantity:${marketId}-${quantity}}} in {{market:${marketId}}}`
    ]
  },

  [MsgType.MsgCreateSpotLimitOrder]: (value: Message, _) => {
    const { sender, order } = value.message

    const { quantity, price } = order.order_info
    const { market_id: marketId } = order

    return [
      `{{account:${sender}}} created a LIMIT ${order.order_type} order for {{spotQuantity:${marketId}-${quantity}}} at {{spotPrice:${marketId}-${price}}} in {{market:${marketId}}}`
    ]
  },

  [MsgType.MsgCreateDerivativeMarketOrder]: (value: Message, _) => {
    const { sender, order } = value.message

    const { quantity } = order.order_info
    const { market_id: marketId } = order

    return [
      `{{account:${sender}}} created a MARKET ${order.order_type} order for {{derivativeQuantity:${marketId}-${quantity}}} in {{market:${marketId}}}`
    ]
  },

  [MsgType.MsgCreateDerivativeLimitOrder]: (value: Message, _) => {
    const { sender, order } = value.message

    const { quantity, price } = order.order_info

    const { market_id: marketId } = order

    return [
      `{{account:${sender}}} created a LIMIT ${order.order_type} order for {{derivativeQuantity:${marketId}-${quantity}}} at {{derivativePrice:${marketId}-${price}}} in {{market:${marketId}}}`
    ]
  },

  [MsgType.MsgCancelSpotOrder]: (value: Message, logs: EventLog[]) => {
    const {
      cid,
      sender,
      market_id: marketId,
      order_hash: orderHash
    } = value.message

    const eventSummary = eventLogsSummaryMap[
      EventMessageType.CancelSpotOrder
    ]?.({
      logs,
      sender,
      args: cid || orderHash
    })

    if (eventSummary) {
      return [eventSummary]
    }

    return [
      `{{account:${sender}}} cancelled order {{ellipsis:${
        cid || orderHash
      }}} in {{market:${marketId}}}`
    ]
  },

  [MsgType.MsgBatchCancelSpotOrders]: (value: Message, logs: EventLog[]) => {
    const { sender, data: orders } = value.message

    return [
      `{{account:${sender}}} cancelled a batch of spot limit orders:`,
      ...orders.map((order: any) => {
        const eventSummary = eventLogsSummaryMap[
          EventMessageType.BatchCancelSpotOrders
        ]?.({
          logs,
          sender,
          args: order.order_hash || order.cid
        })

        return eventSummary
          ? `• ${eventSummary}`
          : `• failed to cancel order {{ellipsis:${order.order_hash}}} in {{market:${order.market_id}}}`
      })
    ]
  },

  [MsgType.MsgBatchCreateSpotLimitOrders]: (value: Message, _) => {
    const { sender, orders } = value.message

    return [
      `{{account:${sender}}} created a batch of spot limit orders:`,
      ...orders.map(
        (order: any) =>
          `• {{spotQuantity:${order.market_id}-${order.order_info.quantity}}} at {{spotPrice:${order.market_id}-${order.order_info.price}}} in {{market:${order.market_id}}}`
      )
    ]
  },

  [MsgType.MsgCancelDerivativeOrder]: (value: Message, logs: EventLog[]) => {
    const {
      cid,
      sender,
      order_hash: orderHash,
      market_id: marketId
    } = value.message

    const eventSummary = eventLogsSummaryMap[
      EventMessageType.CancelDerivativeOrder
    ]?.({
      logs,
      sender,
      args: cid || orderHash
    })

    if (eventSummary) {
      return [eventSummary]
    }

    return [
      `{{account:${sender}}} failed to cancel order {{ellipsis:${
        cid || orderHash
      }}} in {{market:${marketId}}}`
    ]
  },

  [MsgType.MsgBatchCancelDerivativeOrders]: (
    value: Message,
    logs: EventLog[]
  ) => {
    const { sender, data: orders } = value.message

    return [
      `{{account:${sender}}} cancelled a batch of derivative limit orders:`,
      ...orders.map((order: any) => {
        const eventSummary = eventLogsSummaryMap[
          EventMessageType.BatchCancelDerivativeOrders
        ]?.({
          logs,
          sender,
          args: order.order_hash || order.cid
        })

        return eventSummary
          ? `• ${eventSummary}`
          : `• failed to cancel order {{ellipsis:${order.order_hash}}} in {{market:${order.market_id}}}`
      })
    ]
  },

  [MsgType.MsgBatchCreateDerivativeLimitOrders]: (value: Message, _) => {
    const { sender, orders } = value.message

    return [
      `{{account:${sender}}} created a batch of derivative limit orders:`,
      ...orders.map(
        (order: any) =>
          `• {{derivativeQuantity:${order.market_id}-${order.order_info.quantity}}} at {{derivativePrice:${order.market_id}-${order.order_info.price}}} in {{market:${order.market_id}}}`
      )
    ]
  },

  [MsgType.MsgBatchUpdateOrders]: (value: Message, logs: EventLog[]) => {
    const {
      sender,
      spot_orders_to_cancel: spotOrdersToCancel,
      spot_orders_to_create: spotOrdersToCreate,
      derivative_orders_to_cancel: derivativeOrdersToCancel,
      derivative_orders_to_create: derivativeOrdersToCreate,
      spot_market_ids_to_cancel_all: spotMarketIdsToCancelAll,
      derivative_market_ids_to_cancel_all: derivativeMarketIdsToCancelAll
    } = value.message as Record<string, any>

    // Not Used:
    // binary_options_orders_to_cancel
    // binary_options_market_ids_to_cancel_all
    // binary_options_orders_to_create

    const cancelAllSpotMarketIds = spotMarketIdsToCancelAll.map(
      (marketId: string) => {
        return `{{account:${sender}}} cancelled all orders in {{market:${marketId}}}`
      }
    )

    const cancelAllDerivativeMarketIds = derivativeMarketIdsToCancelAll.map(
      (marketId: string) => {
        return `{{account:${sender}}} cancelled all orders in {{market:${marketId}}}`
      }
    )

    const derivativeOrders = derivativeOrdersToCreate.map((order: any) => {
      const { quantity, price } = order.order_info
      const { market_id: marketId } = order

      return `{{account:${sender}}} created a LIMIT ${order.order_type} order for {{derivativeQuantity:${marketId}-${quantity}}} at {{derivativePrice:${marketId}-${price}}} in {{market:${marketId}}}`
    })

    const spotOrders = spotOrdersToCreate.map((order: any) => {
      const { quantity, price } = order.order_info
      const { market_id: marketId } = order

      return `{{account:${sender}}} created a LIMIT ${order.order_type} order for {{spotQuantity:${marketId}-${quantity}}} at {{spotPrice:${marketId}-${price}}} in {{market:${marketId}}}`
    })

    const spotCancelOrders = spotOrdersToCancel.map((order: any) => {
      const { cid, order_hash: orderHash, market_id: marketId } = order

      const eventSummary = eventLogsSummaryMap[
        EventMessageType.CancelSpotOrder
      ]?.({
        logs,
        sender,
        args: order.cid || order.order_hash
      })

      if (eventSummary) {
        return eventSummary
      }

      return `{{account:${sender}}} failed to cancel order  {{ellipsis:${
        cid || orderHash
      }}} in {{market:${marketId}}}`
    })

    const derivativeCancelOrders = derivativeOrdersToCancel.map(
      (order: any) => {
        const eventSummary = eventLogsSummaryMap[
          EventMessageType.CancelDerivativeOrder
        ]?.({
          logs,
          sender,
          args: order.cid || order.order_hash
        })

        if (eventSummary) {
          return eventSummary
        }

        const { cid, order_hash: orderHash, market_id: marketId } = order

        return `{{account:${sender}}} failed to cancel order {{ellipsis:${
          cid || orderHash
        }}} in {{market:${marketId}}}`
      }
    )

    return [
      ...derivativeOrders,
      ...spotOrders,
      ...spotCancelOrders,
      ...derivativeCancelOrders,
      ...cancelAllSpotMarketIds,
      ...cancelAllDerivativeMarketIds
    ]
  },

  [MsgType.MsgIncreasePositionMargin]: (value: Message, _) => {
    const {
      sender,
      amount,
      market_id: marketId,
      source_subaccount_id: sourceSubaccountId,
      destination_subaccount_id: destinationSubaccountId
    } = value.message

    return [
      `{{account:${sender}}} increased position margin by {{denom:${USDT_DENOM}-${amount}}} for the {{market:${marketId}}} from subaccount {{ellipsis:${sourceSubaccountId}}} to subaccount {{ellipsis:${destinationSubaccountId}}}`
    ]
  },

  [MsgType.MsgDecreasePositionMargin]: (value: Message, _) => {
    const {
      sender,
      amount,
      market_id: marketId,
      source_subaccount_id: sourceSubaccountId,
      destination_subaccount_id: destinationSubaccountId
    } = value.message

    return [
      `{{account:${sender}}} decreased position margin by {{denom:${USDT_DENOM}-${amount}}} for the {{market:${marketId}}} from subaccount {{ellipsis:${sourceSubaccountId}}} to subaccount {{ellipsis:${destinationSubaccountId}}}`
    ]
  },

  [MsgType.MsgLiquidatePosition]: (value: Message, _) => {
    const {
      sender,
      market_id: marketId,
      subaccount_id: subaccountId
    } = value.message

    return [
      `{{account:${sender}}} liquidated a position in {{market:${marketId}}} market that belonged to the subaccount {{ellipsis:${subaccountId}}}`
    ]
  }
}

const stakingMsgSummaryMap: Partial<
  Record<
    MsgType,
    (value: Message, logs: EventLog[], injectiveAddress?: string) => string[]
  >
> = {
  [MsgType.MsgDelegate]: (value: Message, _) => {
    const {
      amount: { denom, amount },
      delegator_address: delegator,
      validator_address: validator
    } = value.message

    return [
      `{{account:${delegator}}} staked {{denom:${denom}-${amount}}} to {{validator:${validator}}}`
    ]
  },

  [MsgType.MsgUnjail]: (value: Message, _) => {
    const { validator_addr: validatorAddress } = value.message

    return [`{{validator:${validatorAddress}}} sent an unjail message`]
  },

  [MsgType.MsgCreateValidator]: (value: Message, _) => {
    const {
      description: { moniker },
      validator_address: validatorAddress
    } = value.message

    return [
      `Validator ${moniker} has been created with the address {{account:${validatorAddress}}}`
    ]
  },

  [MsgType.MsgEditValidator]: (value: Message, _) => {
    const {
      description: { moniker },
      validator_address: validatorAddress
    } = value.message

    return [
      `{{validator:${validatorAddress}}} modified ${moniker} validator details`
    ]
  },

  [MsgType.MsgBeginRedelegate]: (value: Message, _) => {
    const {
      amount: { denom, amount },
      delegator_address: delegator,
      validator_src_address: validatorSrc,
      validator_dst_address: validatorDst
    } = value.message

    return [
      `{{account:${delegator}}} redelegated {{denom:${denom}-${amount}}} from {{validator:${validatorSrc}}} to {{validator:${validatorDst}}}`
    ]
  },

  [MsgType.MsgWithdrawDelegatorReward]: (value: Message, _) => {
    const {
      delegator_address: delegatorAddress,
      validator_address: validatorAddress
    } = value.message

    return [
      `{{account:${delegatorAddress}}} claimed rewards from {{validator:${validatorAddress}}}`
    ]
  },

  [MsgType.MsgUndelegate]: (value: Message, _) => {
    const {
      amount: { denom, amount },
      delegator_address: delegator,
      validator_address: validator
    } = value.message

    return [
      `{{account:${delegator}}} unstaked {{denom:${denom}-${amount}}} from {{validator:${validator}}}`
    ]
  }
}

const insuranceMsgSummaryMap: Partial<
  Record<
    MsgType,
    (value: Message, logs: EventLog[], injectiveAddress?: string) => string[]
  >
> = {
  [MsgType.MsgCreateInsuranceFund]: (value: Message, _) => {
    const {
      sender,
      ticker,
      initial_deposit: { amount, denom }
    } = value.message

    return [
      `{{account:${sender}}} created an insurance fund with an initial deposit of {{denom:${denom}-${amount}}} for the ${ticker} market`
    ]
  },

  [MsgType.MsgRequestRedemption]: (value: Message, _) => {
    const {
      sender,
      market_id: marketId,
      amount: { amount, denom }
    } = value.message

    return [
      `{{account:${sender}}} requested a redemption of ${sharedToBalanceInToken(
        { value: amount }
      )} ${denom} from the {{market:${marketId}}} Insurance Fund`
    ]
  },

  [MsgType.MsgUnderwrite]: (value: Message, _) => {
    const {
      sender,
      market_id: marketId,
      deposit: { amount, denom }
    } = value.message

    return [
      `{{account:${sender}}} underwrote {{denom:${denom}-${amount}}} in {{market:${marketId}}} insurance fund`
    ]
  }
}

const peggyMsgSummaryMap: Partial<
  Record<
    MsgType,
    (value: Message, logs: EventLog[], injectiveAddress?: string) => string[]
  >
> = {
  [MsgType.MsgConfirmBatch]: (value: Message, _) => {
    const { orchestrator } = value.message

    return [`${orchestrator} confirmed a batch request`]
  },

  [MsgType.MsgRequestBatch]: (value: Message, _) => {
    const { orchestrator } = value.message

    return [`${orchestrator} sent a batch request`]
  },

  [MsgType.MsgValsetConfirm]: (value: Message, _) => {
    const { orchestrator } = value.message

    return [`${orchestrator} confirmed the Valset`]
  },

  [MsgType.MsgSetOrchestratorAddresses]: (value: Message, _) => {
    const { sender, orchestrator } = value.message

    return [
      `{{account:${sender}}} set the orchestrator address to {{account:${orchestrator}}}`
    ]
  },

  [MsgType.MsgSendToEth]: (value: Message, _) => {
    const { amount, sender, eth_dest: receiver } = value.message

    return [
      `{{account:${sender}}} withdrew {{denom:${amount.denom}-${amount.amount}}} to {{externalAccount:${receiver}}} on Ethereum`
    ]
  }
}

const govMsgSummaryMap: Partial<
  Record<string | MsgType, (value: Message, logs: EventLog[]) => string[]>
> = {
  [MsgType.MsgDepositCosmos]: (value: Message, _) => {
    const { amount, depositor, proposal_id: proposalId } = value.message

    const [coin] = amount

    return [
      `{{account:${depositor}}} deposited {{denom:${coin.denom}-${coin.amount}}} to proposal {{proposal:${proposalId}}}`
    ]
  },
  'cosmos.gov.v1.MsgVote': (value: Message, _) => {
    const { voter, option: optionRaw, proposal_id: proposalId } = value.message

    let option = 'noWithVeto'

    if (optionRaw === 'VOTE_OPTION_YES') {
      option = 'yes'
    }

    if (optionRaw === 'VOTE_OPTION_ABSTAIN') {
      option = 'abstain'
    }

    if (optionRaw === 'VOTE_OPTION_NO') {
      option = 'no'
    }

    return [
      `{{account:${voter}}} voted ${option} for {{proposal:${proposalId}}}`
    ]
  },

  [MsgType.MsgVote]: (value: Message, _) => {
    const { voter, option: optionRaw, proposal_id: proposalId } = value.message

    let option = 'noWithVeto'

    if (optionRaw === 'VOTE_OPTION_YES') {
      option = 'yes'
    }

    if (optionRaw === 'VOTE_OPTION_ABSTAIN') {
      option = 'abstain'
    }

    if (optionRaw === 'VOTE_OPTION_NO') {
      option = 'no'
    }

    return [
      `{{account:${voter}}} voted ${option} for {{proposal:${proposalId}}}`
    ]
  },

  [MsgType.MsgSubmitProposal]: (value: Message, _) => {
    const { proposer, initial_deposit: amount } = value.message

    const [coin] = amount

    return [
      `{{account:${proposer}}} submitted a proposal with an initial deposit of {{denom:${coin.denom}-${coin.amount}}}`
    ]
  }
}

const msgSummaryMap: Partial<
  Record<
    MsgType,
    (value: Message, logs: EventLog[], injectiveAddress?: string) => string[]
  >
> = {
  ...govMsgSummaryMap,
  ...peggyMsgSummaryMap,
  ...stakingMsgSummaryMap,
  ...exchangeMsgSummaryMap,
  ...insuranceMsgSummaryMap,

  [MsgType.MsgSend]: (value: Message, _, injectiveAddress) => {
    const { amount, from_address: sender, to_address: receiver } = value.message
    const [coin] = amount as { denom: string; amount: string }[]

    if (!injectiveAddress) {
      return [
        `{{account:${sender}}} sent {{denom:${coin.denom}-${coin.amount}}} to {{account:${receiver}}}`
      ]
    }

    return [
      injectiveAddress === sender
        ? `Sent {{denom:${coin.denom}-${coin.amount}}} to {{account:${receiver}}}`
        : `Received {{denom:${coin.denom}-${coin.amount}}} from {{account:${sender}}}`
    ]
  },

  [MsgType.MsgMultiSend]: (value: Message, _) => {
    const { inputs, outputs } = value.message

    return [
      ...inputs.map(
        (sender: { coins: Coin[]; address: string }) =>
          `{{account:${sender.address}}} ${sender.coins
            .map(({ denom, amount }) => `sent {{denom:${denom}-${amount}}}`)
            .join(', ')}`
      ),
      ...outputs.map(
        (sender: { coins: Coin[]; address: string }) =>
          `{{account:${sender.address}}} ${sender.coins
            .map(({ denom, amount }) => `received {{denom:${denom}-${amount}}}`)
            .join(', ')}`
      )
    ]
  },

  [MsgType.MsgRecvPacket]: (value: Message, _) => {
    const { packet } = value.message
    const decodedPacketData = JSON.parse(
      Buffer.from(packet.data, 'base64').toString('utf-8')
    )

    const { amount, denom, sender, receiver } = decodedPacketData

    if (!amount && !denom && !sender && !receiver) {
      return []
    }

    const injNetworkDenom = denom.split('/').pop()

    return [
      `{{externalAccount:${sender}}} deposited {{denom:${injNetworkDenom}-${amount}}} to {{account:${receiver}}} from ${getNetworkFromAddress(
        sender
      )}`
    ]
  },

  [MsgType.MsgExternalTransfer]: (value: Message, _) => {
    const {
      sender,
      amount: { denom, amount },
      source_subaccount_id: sourceSubaccountId,
      destination_subaccount_id: destinationSubaccountId
    } = value.message

    const suffix =
      destinationSubaccountId === AUCTION_POOL_SUBACCOUNT_ID
        ? ' as a contribution to the next auction pool'
        : ''

    return [
      `{{account:${sender}}} transferred {{denom:${denom}-${amount}}} from {{ellipsis:${sourceSubaccountId}}} to subaccount {{ellipsis:${destinationSubaccountId}}}${suffix}`
    ]
  },

  [MsgType.MsgDeposit]: (value: Message, _) => {
    const {
      amount: { amount, denom },
      subaccount_id: subaccount,
      sender
    } = value.message

    return [
      `{{account:${sender}}} deposited {{denom:${denom}-${amount}}} to subaccount {{ellipsis:${subaccount}}}`
    ]
  },

  [MsgType.MsgDepositClaim]: (value: Message, _) => {
    const {
      amount,
      token_contract: denom,
      ethereum_sender: sender,
      cosmos_receiver: receiver
    } = value.message

    return [
      `{{externalAccount:${sender}}} deposited {{denom:${denom}-${amount}}} to {{account:${receiver}}} on Injective`
    ]
  },

  [MsgType.MsgExec]: (value: Message, logs: EventLog[]) => {
    const execMsgs = (value.message as any).msgs.map((msg: any) => ({
      type: msg['@type'],
      message: msg
    })) as Message[]

    return execMsgs
      .map((msg) => getHumanReadableMessage({ value: msg, logs }))
      .flat()
  },

  [MsgType.MsgBid]: (value: Message, _) => {
    const {
      sender,
      round,
      bid_amount: { denom, amount }
    } = value.message

    return [
      `{{account:${sender}}} submitted a bid of {{denom:${denom}-${amount}}} in round ${round}`
    ]
  },

  [MsgType.MsgTransfer]: (value: Message, _) => {
    const {
      sender,
      receiver: toAddress,
      token: { denom, amount }
    } = value.message

    return [
      `{{account:${sender}}} withdrew {{denom:${denom}-${amount}}} to {{account:${toAddress}}} from {{network:${getNetworkFromAddress(
        sender
      )}}}`
    ]
  },

  [MsgType.MsgSubaccountTransfer]: (value: Message, _) => {
    const {
      sender,
      amount: { denom, amount },
      source_subaccount_id: sourceSubaccountId,
      destination_subaccount_id: destinationSubaccountId
    } = value.message

    return [
      `{{account:${sender}}} transferred {{denom:${denom}-${amount}}} from subaccount {{ellipsis:${sourceSubaccountId}}} to subaccount {{ellipsis:${destinationSubaccountId}}}`
    ]
  },

  [MsgType.MsgExecuteContract]: (value: Message, logs: EventLog[]) => {
    const { sender, contract: contractAddress } = value.message

    const contractType = contractMsgTypeMap[contractAddress]

    if (!contractType) {
      return []
    }

    const contractSummary = contractEventSummaryMap[contractType]?.({
      logs,
      sender
    })

    return contractSummary ? [contractSummary] : []
  },

  [MsgType.MsgExecuteContractCompat]: (value: Message, logs: EventLog[]) => {
    const { sender, contract: contractAddress } = value.message

    const contractType = contractMsgTypeMap[contractAddress]

    if (!contractType) {
      return []
    }

    const contractSummary = contractEventSummaryMap[contractType]?.({
      logs,
      sender
    })

    return contractSummary ? [contractSummary] : []
  }
}

export const getHumanReadableMessage = ({
  logs,
  value,
  injectiveAddress
}: {
  value: Message
  logs: EventLog[]
  injectiveAddress?: string
}): string[] => {
  const { type } = value

  const msgType = (type.startsWith('/') ? type.slice(1) : type) as MsgType

  if (msgSummaryMap[msgType]) {
    return msgSummaryMap[msgType](value, logs, injectiveAddress)
  }

  return []
}

// todo:
// /ibc.core.channel.v1.MsgTimeout

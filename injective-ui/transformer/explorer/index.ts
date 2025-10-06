import { unknownToken } from '../../data/token'
import { msgTypeMap } from '../../data/explorer'
import { MsgType } from '@injectivelabs/ts-types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { getHumanReadableMessage } from './messageSummary'
import { sharedCoinStringToCoins } from './../../utils/formatter'
import { hardCodedContractCopyMap } from './../../utils/explorer'
import { TokenType, TokenVerification } from '@injectivelabs/sdk-ts'
import type {
  Coin,
  Message,
  EventLogEvent,
  ContractTransaction,
  ExplorerTransaction,
  CW20BalanceExplorerApiResponse
} from '@injectivelabs/sdk-ts'
import type {
  UiContractTransaction,
  UiExplorerTransaction,
  SharedBalanceWithToken
} from '../../types'

export const toUiCw20Balance = (
  cw20Balance: CW20BalanceExplorerApiResponse
): SharedBalanceWithToken => {
  const denom = cw20Balance.contract_address
  const tokenInfo = cw20Balance.cw20_metadata?.token_info
  const marketingInfo = cw20Balance.cw20_metadata?.marketing_info

  return {
    denom,
    balance: cw20Balance.balance,
    token: {
      coinGeckoId: '',
      denom,
      address: denom,
      name: tokenInfo?.name || unknownToken.name,
      decimals: tokenInfo?.decimals || unknownToken.decimals,
      symbol: tokenInfo?.symbol || unknownToken.symbol,
      logo: marketingInfo?.logo || unknownToken.logo,
      tokenType: TokenType.Cw20,
      tokenVerification: TokenVerification.Internal
    }
  }
}

const getMsgType = (msg: Message): MsgType => {
  const type = msg.type || (msg as unknown as { '@type': string })['@type']

  if (type.startsWith('/')) {
    return type.split('/')[1] as MsgType
  }

  return type as MsgType
}

// get MsgExec sender address
// const getAuthzMsgSender = ({
//   events,
//   msgIndex,
//   authzMsgIndex
// }: {
//   msgIndex?: string
//   authzMsgIndex?: string
//   events: EventLogEvent[]
// }): string | undefined => {
//   if (!msgIndex || !authzMsgIndex) {
//     return
//   }

//   const authZMsgKeys = ['sender', 'authz_msg_index', 'msg_index']
//   const authZMsgEvents = events.filter(({ type }) => type === 'message')

//   if (!authZMsgEvents.length) {
//     return undefined
//   }

//   const authZSenderEvent = authZMsgEvents.find(({ attributes }) => {
//     const keys = attributes.map((attribute) => attribute.key)

//     if (keys.length !== authZMsgKeys.length) {
//       return false
//     }

//     const eventMatchesFormat = authZMsgKeys.every((key) => keys.includes(key))

//     if (!eventMatchesFormat) {
//       return false
//     }

//     const msgIndexAttribute = attributes.find(
//       ({ key, value }) => key === 'msg_index' && value === msgIndex
//     )
//     const authzMsgIndexAttribute = attributes.find(
//       ({ key, value }) => key === 'authz_msg_index' && value === authzMsgIndex
//     )

//     return msgIndexAttribute && authzMsgIndexAttribute
//   })

//   return authZSenderEvent?.attributes.find(({ key }) => key === 'sender')?.value
// }

export const getCoins = ({
  events,
  sender,
  eventType,
  attributeType
}: {
  sender: string
  eventType: string
  attributeType: string
  events?: EventLogEvent[]
}): Coin[] => {
  if (!events) {
    return []
  }

  const ownerCoinEvents = events.filter((log) => {
    if (log.type !== eventType) {
      return false
    }

    return log.attributes.some(
      ({ key, value }) => key === attributeType && value === sender
    )
  })

  const coinsDenomMap = ownerCoinEvents.reduce(
    (list, { attributes }) => {
      const amount = attributes.find(({ key }) => key === 'amount')?.value

      if (!amount) {
        return list
      }

      const coins = sharedCoinStringToCoins(amount)

      coins.forEach((coin) => {
        if (list[coin.denom]) {
          list[coin.denom] = list[coin.denom].plus(coin.amount)

          return
        }

        list[coin.denom] = new BigNumberInBase(coin.amount)
      })

      return list
    },
    {} as Record<string, BigNumberInBase>
  )

  return Object.entries(coinsDenomMap).reduce((list, [denom, amount]) => {
    list = [
      ...list,
      {
        denom,
        amount: amount.toFixed()
      }
    ]

    return list
  }, [] as Coin[])
}

const getMsgTypeSuffix = (message: Message): string | undefined => {
  const type = getMsgType(message)

  if (type === MsgType.MsgExec) {
    return msgTypeMap[getMsgType(message.message.msgs[0])]
  }

  if (type === MsgType.MsgExecuteContractCompat) {
    return hardCodedContractCopyMap[message.message.contract]
  }

  return undefined
}

const formatMsgType = (message: Message): string => {
  const type = getMsgType(message)
  const formattedType = msgTypeMap[type] || message.type

  const suffix = getMsgTypeSuffix(message)

  if (!suffix) {
    return formattedType
  }

  return `${formattedType} - ${suffix}`
}

const getSenderFromEvents = (events: EventLogEvent[]) => {
  return events
    .reduce(
      (list, event) => {
        return [...list, ...(event.attributes || [])]
      },
      [] as { key: string; value: string }[]
    )
    .find(({ key, value }) => key === 'sender' && value.startsWith('inj'))
    ?.value
}

const getTypesAndCoins = (
  transaction: ExplorerTransaction | ContractTransaction
) => {
  const events = (transaction.logs || []).flatMap(({ events }) => events)
  const sender =
    transaction?.signatures?.[0]?.address ||
    (getSenderFromEvents(events) as string)

  try {
    return {
      types: transaction.messages.map(formatMsgType),
      coinReceived: getCoins({
        events,
        sender,
        attributeType: 'receiver',
        eventType: 'coin_received'
      }),
      coinSpent: getCoins({
        events,
        sender,
        attributeType: 'spender',
        eventType: 'coin_spent'
      })
    }
  } catch (error) {
    console.error('Error getting types and coins:', error, transaction)
    return {
      types: [],
      coinReceived: [],
      coinSpent: []
    }
  }
}

export const toUiTransaction = (
  transaction: ExplorerTransaction,
  injectiveAddress?: string
): UiExplorerTransaction => {
  return {
    ...transaction,
    ...getTypesAndCoins(transaction),
    templateSummaries: transaction.messages.map((message) => ({
      type: message.type,
      summary: getHumanReadableMessage({
        value: message,
        injectiveAddress,
        logs: transaction.logs || []
      })
    }))
  }
}

export const toUiContractTransaction = (
  transaction: ContractTransaction
): UiContractTransaction => {
  return {
    ...transaction,
    hash: transaction.txHash,
    blockNumber: transaction.height,
    blockTimestamp: transaction.time,
    ...getTypesAndCoins(transaction)
  }
}

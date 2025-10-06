import { TokenType } from '@injectivelabs/sdk-ts'
import {
  canonicalChannelIds,
  canonicalChannelsToChainList
} from './../data/ibc'
import type { TokenStatic } from '@injectivelabs/sdk-ts'

export const isIbcTokenCanonical = (token: TokenStatic) => {
  const { denom } = token

  if (!denom.startsWith('ibc/') || !token.path) {
    return false
  }

  const pathParts = token.path.replace('transfer/', '').split('/')

  /** More than one channelId */
  if (pathParts.length > 1) {
    return false
  }

  const [channelId] = pathParts

  return canonicalChannelIds.includes(channelId)
}

export const canonicalChannelsToChainListFromInjective =
  canonicalChannelsToChainList.filter((item) => item.chainA === 'Injective')

export const getIbcDestinationChain = ({
  channelPaths,
  channel,
  index,
  token
}: {
  index: number
  channel: string
  token: TokenStatic
  channelPaths: string[]
}) => {
  if (token.tokenType !== TokenType.Ibc) {
    return ''
  }

  const foundChannelFromInjective =
    canonicalChannelsToChainListFromInjective.find(
      (item) => item.channelId === channel
    )

  if (foundChannelFromInjective) {
    return foundChannelFromInjective.chainB
  }

  if (index === channelPaths.length - 1) {
    return token.name
  }

  return ''
}

export const formatNonCanonicalIbcTokenName = (token: TokenStatic): string => {
  const channelId = token.channelId
  const baseDenom = token.baseDenom

  if (!channelId || !baseDenom) {
    return 'Unknown'
  }

  const formattedDenomTrace = (token?.channelId || '').replaceAll(
    'transfer/',
    ''
  )
  const channelToLastChain = formattedDenomTrace.split('/').shift()

  const foundChannelFromInjective =
    canonicalChannelsToChainListFromInjective.find(
      (item) => item.channelId === channelToLastChain
    )

  const lastChain = foundChannelFromInjective
    ? foundChannelFromInjective.chainB
    : 'Unknown'

  // Fix for very long base denoms
  if (baseDenom.startsWith('cw20:') || baseDenom.startsWith('factory')) {
    return `${token.symbol.toUpperCase()}-${lastChain.toLowerCase()}-${channelToLastChain}`
  }

  return `${baseDenom.toUpperCase()}-${lastChain.toLowerCase()}-${channelToLastChain}`
}

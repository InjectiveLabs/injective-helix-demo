import path from 'path'
import { TokenMeta } from '@injectivelabs/token-metadata'
import { GrpcTokenMeta } from '@injectivelabs/derivatives-consumer'
import { peggyDenomToContractAddress } from './peggy'
import { Token } from '~/types'

export const tokenMetaToToken = (
  tokenMeta?: TokenMeta,
  denom?: string
): Token | undefined => {
  if (!tokenMeta) {
    return
  }

  return {
    symbol: tokenMeta.symbol,
    name: tokenMeta.name,
    icon: path.join(
      '/',
      'vendor',
      '@injectivelabs',
      'token-metadata',
      tokenMeta.logo
    ),
    decimals: tokenMeta.decimals,
    address: denom ? peggyDenomToContractAddress(denom) : tokenMeta.address,
    denom: denom || tokenMeta.address
  }
}

export const grpcTokenMetaToToken = (
  tokenMeta?: GrpcTokenMeta.AsObject,
  denom?: string
): Token | undefined => {
  if (!tokenMeta) {
    return
  }

  return {
    symbol: tokenMeta.symbol,
    name: tokenMeta.name,
    icon: tokenMeta.logo,
    decimals: tokenMeta.decimals,
    address: denom ? peggyDenomToContractAddress(denom) : tokenMeta.address,
    denom: denom || tokenMeta.address
  }
}

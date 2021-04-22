import { contractAddresses } from '@injectivelabs/contracts'
import { Token } from '~/types'
import { TESTNET_CHAIN_ID } from '~/app/utils/constants'
import { tokensMetaData } from '~/app/tokens/meta'

export const peggyDenomToTokenFromContractAddress = (denom: string): Token => {
  if (!tokensMetaData.has(denom.toLowerCase())) {
    throw new Error(`Token for denom ${denom} not found!`)
  }

  const token = tokensMetaData.get(denom.toLowerCase())

  if (!token) {
    throw new Error(`Token for denom ${denom} not found!`)
  }

  return {
    ...token,
    denom,
    address: peggyDenomToContractAddress(denom)
  }
}

export const peggyDenomToContractAddress = (denom: string): string => {
  const denomLowerCased = denom.toLowerCase()
  const contractAddress = denomLowerCased.replace('peggy', '')
  const injectiveContractAddress = contractAddresses[TESTNET_CHAIN_ID].injective

  return denomLowerCased === 'inj' ? injectiveContractAddress : contractAddress
}

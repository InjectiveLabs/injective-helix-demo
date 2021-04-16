import { contractAddresses } from '@injectivelabs/contracts'
import { Token } from '~/types'
import { MAINNET_CHAIN_ID } from '~/app/utils/constants'
import { denomsMap } from '~/app/tokens/denoms'

export const peggyDenomToTokenFromContractAddress = (denom: string): Token => {
  if (!denomsMap.has(denom.toLowerCase())) {
    throw new Error(`Token for denom ${denom} not found!`)
  }

  const token = denomsMap.get(denom.toLowerCase())
  const contractAddress = denom.replace('peggy', '')
  const injectiveContractAddress = contractAddresses[MAINNET_CHAIN_ID].injective

  if (!token) {
    throw new Error(`Token for denom ${denom} not found!`)
  }

  return {
    ...token,
    address:
      denom.toLowerCase() === 'inj' ? injectiveContractAddress : contractAddress
  }
}

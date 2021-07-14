import { contractAddresses } from '@injectivelabs/contracts'
import { CHAIN_ID } from '~/app/utils/constants'

export const peggyDenomToContractAddress = (denom: string): string => {
  const denomLowerCased = denom.toLowerCase()
  const contractAddress = denomLowerCased.replace('peggy', '')
  const injectiveContractAddress = contractAddresses[CHAIN_ID].injective

  return denomLowerCased === 'inj' ? injectiveContractAddress : contractAddress
}

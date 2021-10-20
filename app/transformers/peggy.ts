import { contractAddresses } from '@injectivelabs/contracts'
import { CHAIN_ID, INJECTIVE_DENOM } from '~/app/utils/constants'

export const peggyDenomToContractAddress = (denom: string): string => {
  const denomLowerCased = denom.toLowerCase()
  const contractAddress = denomLowerCased.replace('peggy', '')
  const injectiveContractAddress = contractAddresses[CHAIN_ID].injective

  return denomLowerCased === INJECTIVE_DENOM
    ? injectiveContractAddress
    : contractAddress
}

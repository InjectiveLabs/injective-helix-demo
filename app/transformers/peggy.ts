import { getTokenMetaDataBySymbol } from '../services/tokens'
import { INJECTIVE_DENOM } from '~/app/utils/constants'

export const peggyDenomToContractAddress = (denom: string): string => {
  const denomLowerCased = denom.toLowerCase()
  const contractAddress = denomLowerCased.replace('peggy', '')
  const injectiveContractAddress = getTokenMetaDataBySymbol('INJ')!.address

  return denomLowerCased === INJECTIVE_DENOM
    ? injectiveContractAddress
    : contractAddress
}

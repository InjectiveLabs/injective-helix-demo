import {
  Contracts,
  getContractAddressesForChainOrThrow
} from '@injectivelabs/contracts'
import { CHAIN_ID } from '~/app/utils/constants'
import { getWeb3Strategy } from '~/app/web3'

let contracts: Contracts
export const getContracts = (): Contracts => {
  if (!contracts) {
    contracts = new Contracts({
      web3Strategy: getWeb3Strategy(),
      contractAddresses: getContractAddressesForChainOrThrow(
        parseInt(CHAIN_ID.toString())
      ),
      chainId: CHAIN_ID
    })
  }

  return contracts
}

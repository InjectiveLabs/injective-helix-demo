import {
  Contracts,
  getContractAddressesForChainOrThrow
} from '@injectivelabs/contracts'
import { TESTNET_CHAIN_ID } from '../utils/constants'
import { getWeb3Strategy } from '../web3'

let contracts: Contracts
export const getContracts = (): Contracts => {
  if (!contracts) {
    contracts = new Contracts({
      web3Strategy: getWeb3Strategy(),
      contractAddresses: getContractAddressesForChainOrThrow(
        parseInt(TESTNET_CHAIN_ID.toString())
      ),
      chainId: TESTNET_CHAIN_ID
    })
  }

  return contracts
}

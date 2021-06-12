import { ChainId } from '@injectivelabs/ts-types'
import { Web3Exception } from '@injectivelabs/exceptions'
import { TESTNET_CHAIN_ID } from '../utils/constants'
import { getWeb3Strategy } from '~/app/web3'

export const validateMetamask = async (chainId: ChainId = TESTNET_CHAIN_ID) => {
  const web3Strategy = getWeb3Strategy()
  const addresses = await web3Strategy.getAddresses()

  if (addresses.length === 0) {
    throw new Web3Exception(
      'Your metamask is locked. Please unlock your Metamask.'
    )
  }

  const metamaskChainId = await web3Strategy.getChainId()

  if (chainId.toString() !== metamaskChainId) {
    throw new Web3Exception(
      'Your metamask network is wrong. Please change to Kovan Network'
    )
  }
}

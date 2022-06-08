import { EthereumChainId } from '@injectivelabs/ts-types'
import { Web3Exception } from '@injectivelabs/exceptions'
import detectEthereumProvider from '@metamask/detect-provider'
import { ETHEREUM_CHAIN_ID } from '../utils/constants'
import { web3Strategy } from '../web3'

export const isMetamaskInstalled = async (): Promise<boolean> => {
  const provider = await detectEthereumProvider()

  return !!provider
}

export const validateMetamask = async (
  address: string,
  chainId: EthereumChainId = ETHEREUM_CHAIN_ID
) => {
  const addresses = await web3Strategy.getAddresses()
  const metamaskIsLocked = addresses.length === 0

  if (metamaskIsLocked) {
    throw new Web3Exception(
      'Your Metamask is currently locked. Please unlock your Metamask.'
    )
  }

  const [metamaskActiveAddress] = addresses
  const metamaskActiveAddressDoesntMatchTheActiveAddress =
    address && metamaskActiveAddress.toLowerCase() !== address.toLowerCase()

  if (metamaskActiveAddressDoesntMatchTheActiveAddress) {
    throw new Web3Exception(
      'You are connected to the wrong address. Please logout and connect to Metamask again'
    )
  }

  const metamaskChainId = parseInt(await web3Strategy.getChainId(), 16)
  const metamaskChainIdDoesntMatchTheActiveChainId = chainId !== metamaskChainId

  if (metamaskChainIdDoesntMatchTheActiveChainId) {
    throw new Web3Exception(
      `Please change your Metamask network to ${
        chainId === EthereumChainId.Kovan
          ? 'Kovan Test Network'
          : 'Ethereum Mainnet'
      }`
    )
  }
}

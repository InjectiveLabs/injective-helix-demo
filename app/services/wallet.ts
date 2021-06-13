import { ConcreteStrategyOptions, Wallet } from '@injectivelabs/web3-strategy'
import { AccountAddress } from '@injectivelabs/ts-types'
import { Web3Exception } from '@injectivelabs/exceptions'
import { getWeb3Strategy, initWeb3Strategy } from '~/app/web3'

export const connect = (
  wallet: Wallet,
  options: Partial<ConcreteStrategyOptions> = {}
) => {
  initWeb3Strategy(wallet, options)
}

export const getAddresses = async (): Promise<AccountAddress[]> => {
  const web3Strategy = getWeb3Strategy()
  const addresses = await web3Strategy.getAddresses()

  if (addresses.length === 0) {
    throw new Web3Exception('There are no addresses linked in this wallet.')
  }

  return addresses
}

export const confirm = async (address: AccountAddress) => {
  const web3Strategy = getWeb3Strategy()

  return await web3Strategy.confirm(address)
}

import { Wallet } from '@injectivelabs/web3-strategy'
import { AccountAddress } from '@injectivelabs/ts-types'
import { Web3Exception } from '@injectivelabs/exceptions'
import { getWeb3Strategy, initWeb3Strategy } from '~/app/web3'

export const connect = async (wallet: Wallet): Promise<AccountAddress[]> => {
  const web3Strategy = initWeb3Strategy(wallet)
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

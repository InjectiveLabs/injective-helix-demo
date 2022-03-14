import { Wallet } from '@injectivelabs/web3-strategy'
import { Web3Exception } from '@injectivelabs/exceptions'
import { web3Strategy } from '~/app/web3'

export const connect = ({
  wallet
}: {
  wallet: Wallet
  onAccountChangeCallback?: (account: string) => void
}) => {
  web3Strategy.setWallet(wallet)
}

export const getAddresses = async (): Promise<string[]> => {
  const addresses = await web3Strategy.getAddresses()

  if (addresses.length === 0) {
    throw new Web3Exception('There are no addresses linked in this wallet.')
  }

  return addresses
}

export const confirm = async (address: string) => {
  return await web3Strategy.confirm(address)
}

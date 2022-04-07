import { Wallet } from '@injectivelabs/web3-strategy'
import { Web3Exception } from '@injectivelabs/exceptions'
import { web3Strategy } from '~/app/web3'
import { blacklistedAddresses } from '~/app/data/wallet-address'
import { GEO_IP_RESTRICTIONS_ENABLED } from '~/app/utils/constants'

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

  if (GEO_IP_RESTRICTIONS_ENABLED) {
    const [address] = addresses
    const addressIsBlackListed =
      blacklistedAddresses.find(
        (blacklistedAddress) =>
          blacklistedAddress.toLowerCase() === address.toLowerCase()
      ) !== undefined

    if (addressIsBlackListed) {
      throw new Web3Exception('This addresses is restricted.')
    }
  }

  return addresses
}

export const confirm = async (address: string) => {
  return await web3Strategy.confirm(address)
}

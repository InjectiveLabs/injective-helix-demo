import { loadAlchemyType } from './../utils/lib'
import { Network as AlchemyNetwork } from 'alchemy-sdk'
import {
  IS_MAINNET,
  ALCHEMY_KEY,
  ALCHEMY_SEPOLIA_KEY
} from './../utils/constant'

export const getAlchemyClient = async () => {
  const Alchemy = await loadAlchemyType()

  return IS_MAINNET
    ? new Alchemy({
        apiKey: ALCHEMY_KEY,
        network: AlchemyNetwork.ETH_MAINNET
      })
    : new Alchemy({
        apiKey: ALCHEMY_SEPOLIA_KEY,
        network: AlchemyNetwork.ETH_SEPOLIA
      })
}

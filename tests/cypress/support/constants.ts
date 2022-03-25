import { Network } from '@injectivelabs/networks'
import { getUrlEndpointForNetwork } from '@injectivelabs/networks'

export const MAKERS_FEE = 0.001
export const TAKERS_FEE = 0.002
export const NETWORK = Network.Devnet1
export const ENDPOINT = getUrlEndpointForNetwork(NETWORK)
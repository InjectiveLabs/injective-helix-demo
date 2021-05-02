import {
  BigNumber,
  BigNumberInWei,
  BigNumberInBase
} from '@injectivelabs/utils'
import { Network } from '@injectivelabs/networks'
import { ChainId } from '@injectivelabs/ts-types'

export const IS_DEVELOPMENT: boolean = process.env.NODE_ENV === 'development'
export const IS_PRODUCTION: boolean = process.env.NODE_ENV === 'production'

export const ZERO: BigNumber = new BigNumber(0)
export const ZERO_IN_WEI: BigNumberInWei = new BigNumberInWei(0)
export const ZERO_IN_BASE: BigNumberInBase = new BigNumberInBase(0)
export const UNLIMITED_ALLOWANCE_IN_BASE_UNITS: BigNumberInBase = new BigNumberInBase(
  2
)
  .pow(256)
  .minus(1)

export const TX_DEFAULTS = {
  gas: 80_000_000,
  gasPrice: 0
}

export const ZERO_ADDRESS: string = '0x0000000000000000000000000000000000000000'
export const ZERO_BYTES_32: string =
  '0x0000000000000000000000000000000000000000000000000000000000000000'
export const ZERO_MARKET_ID: string =
  '0x000000000000000000000000000000000000000000000000000000000000000000000000'
export const NULL_BYTES: string = '0x'

export const SECONDS_IN_A_DAY: BigNumber = new BigNumber(60 * 60 * 24)
export const GWEI_IN_WEI: BigNumber = new BigNumber(1000000000)
export const BASE_URL: string = process.env.APP_BASE_URL
export const FEE_RECIPIENT: string = process.env.APP_FEE_RECIPIENT
export const UI_DEFAULT_DISPLAY_DECIMALS = 4
export const UI_DEFAULT_PRICE_DISPLAY_DECIMALS = 4
export const UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS = 4

export const NETWORK: Network = process.env.APP_NETWORK || Network.Staking
export const CHAIN_ID: ChainId = ChainId.Injective
export const NETWORK_ID: number = ChainId.Injective
export const MAINNET_CHAIN_ID: ChainId = ChainId.Mainnet
export const TESTNET_CHAIN_ID: ChainId = ChainId.Kovan

export const RPC_POLING_INTERVAL: number = 4000

export const TESTNET_GAS_PRICE = new BigNumber(6).times(GWEI_IN_WEI)

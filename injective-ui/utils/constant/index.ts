import {
  BigNumber,
  toBigNumber,
  BigNumberInWei,
  BigNumberInBase
} from '@injectivelabs/utils'

export * from './setup'

export const INJ_LOGO_URL =
  'https://imagedelivery.net/lPzngbR8EltRfBOi_WYaXw/efaa2c96-5463-4707-0d2b-19e5b63df000/public'
export const INJ_LOGO_DARK_URL =
  'https://imagedelivery.net/lPzngbR8EltRfBOi_WYaXw/60aee853-77a2-40b1-04bd-b4aba9312000/public'
export const USDT_LOGO_URL =
  'https://imagedelivery.net/lPzngbR8EltRfBOi_WYaXw/a0bd252b-1005-47ef-d209-7c1c4a3cbf00/public'
export const AUSD_LOGO_URL =
  'https://imagedelivery.net/lPzngbR8EltRfBOi_WYaXw/4b446611-8af6-424f-abc6-e41defe1d800/public'
export const UNKNOWN_LOGO_URL =
  'https://imagedelivery.net/lPzngbR8EltRfBOi_WYaXw/6f015260-c589-499f-b692-a57964af9900/public'

export const INJ_DENOM = 'inj'
export const ETH_DENOM = 'peggy0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
export const USDT_DENOM = 'peggy0xdAC17F958D2ee523a2206206994597C13D831ec7'
export const BINANCE_DEPOSIT_ADDRESS =
  'inj1u2rajhqtptzvu23leheta9yg99k3hazf4waf43'

export const ZERO_IN_WEI: BigNumberInWei = new BigNumberInWei(0)
export const ZERO_IN_BASE: BigNumberInBase = new BigNumberInBase(0)
export const ONE_IN_BASE: BigNumberInBase = new BigNumberInBase(1)

export const NUMBER_REGEX = new RegExp(/^-?(0|[1-9]\d*)?(\.\d+)?$/)

export const GWEI_IN_WEI: BigNumber = new BigNumber(1000000000)
export const DEFAULT_GAS_PRICE = new BigNumber(120).times(GWEI_IN_WEI)
export const DEFAULT_MAINNET_GAS_PRICE = new BigNumber(30).times(GWEI_IN_WEI)
export const SECONDS_IN_A_DAY = toBigNumber(60 * 60 * 24)
export const INJ_REQUIRED_FOR_GAS = 0.005

export const UTC_TIMEZONE = 'Etc/Greenwich'

export const MSG_TYPE_URL_MSG_EXECUTE_CONTRACT =
  '/injective.wasmx.v1.MsgExecuteContractCompat'

export const JSON_POLL_INTERVAL = 1000 * 60 * 10 // 10 minutes

export const LONG_TOAST_TEXT = 25
export const DEFAULT_NOTIFICATION_TIMEOUT = 6 * 1000
export const MAX_TOAST_TIMEOUT = 10 * 24 * 60 * 60 * 1000 // 10 days

export const NOTIFI_LINK = 'https://injective.notifi.network'

export const DEFAULT_USD_DECIMALS = 2
export const DEFAULT_ASSET_DECIMALS = 6
export const DEFAULT_DISPLAY_DECIMALS = 8
export const DEFAULT_PERCENTAGE_DECIMALS = 2

export const DEFAULT_ABBREVIATED_DECIMALS = 2
export const DEFAULT_ABBREVIATION_THRESHOLD = 1_000_000

export const DEFAULT_SUBSCRIPT_DECIMALS = 4
export const DEFAULT_SUBSCRIPT_THRESHOLD_DECIMALS = 3

// Turnkey iframe container id used by layouts/default.vue
export const TURNKEY_CONTAINER_ID = 'TURNKEY_CONTAINER_ID'

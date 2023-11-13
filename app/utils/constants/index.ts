import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { IS_DEVNET, IS_TESTNET, IS_MAINNET } from './setup'

export * from './setup'

export const UI_DEFAULT_MIN_DISPLAY_DECIMALS = 2
export const UI_DEFAULT_DISPLAY_DECIMALS = 4
export const UI_DEFAULT_MAX_DISPLAY_DECIMALS = 6
export const UI_DEFAULT_PRICE_DISPLAY_DECIMALS = 4
export const UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS = 4
export const UI_DEFAULT_AGGREGATION_DECIMALS = 3
export const UI_DEFAULT_AGGREGATION_DECIMALS_STRING = '3'
export const UI_DEFAULT_BINARY_OPTIONS_PRICE_DECIMALS = 4
export const UI_DEFAULT_TOKEN_ASSET_DECIMALS = 8
export const UI_DEFAULT_MAX_NUMBER_OF_ORDERS = 20
export const UI_MINIMAL_AMOUNT = new BigNumber(1).shiftedBy(
  -UI_DEFAULT_MIN_DISPLAY_DECIMALS
)
export const MAX_QUOTE_DECIMALS = 3
export const UI_MAX_PAGINATION_LIMIT_COUNT = 50

export const BIG_NUMBER_ROUND_HALF_UP_MODE = BigNumber.ROUND_HALF_UP
// 6 gwei for Kovan, fetched from gasStation for Mainnet
export const DEFAULT_PRICE_WARNING_DEVIATION = new BigNumber(5) // 5%
export const BIGGER_PRICE_WARNING_DEVIATION = new BigNumber(30) // 30%
export const DEFAULT_MARKET_PRICE_WARNING_DEVIATION = new BigNumber(10) // 10%
export const DEFAULT_SLIPPAGE = new BigNumber(0.5) // +0.5% slippage
export const MAX_SLIPPAGE = new BigNumber(50) // +50% slippage
export const DEFAULT_MAX_SLIPPAGE_FOR_CLOSING_POSITIONS = new BigNumber(100) // +100% slippage
export const DEFAULT_MIN_PRICE_BAND_DIFFERENCE = new BigNumber(80) // -80%
export const DEFAULT_MAX_PRICE_BAND_DIFFERENCE = new BigNumber(400) // +400%
export const DEFAULT_CAPPED_TRADE_AND_EARN_REWARDS = 25

export const MAX_DISPLAYABLE_NUMBER = new BigNumberInBase(1_000_000_000)

export const MIN_AMOUNT_REQUIRED_FOR_GAS_REBATE = 500
export const MIN_TIMESTAMP_REQUIRED_FOR_GAS_REBATE = 1638313200 // 01 Dec 2020 00:00
export const OLP_TIME_STAMP_FORMAT = "MMM-dd-yyyy HH:mm:ss 'UTC'xxx"

export const DATE_TIME_DISPLAY = 'dd MMM HH:mm:ss'

export const VPN_PROXY_VALIDATION_PERIOD = 7 /* 7 days */

export const ETH_COIN_GECKO_ID = 'ethereum'
export const USDT_COIN_GECKO_ID = 'tether'
export const USDC_COIN_GECKO_ID = 'usd-coin'
export const UST_COIN_GECKO_ID = 'terrausd'
export const QUOTE_DENOMS_GECKO_IDS = [
  ETH_COIN_GECKO_ID,
  USDT_COIN_GECKO_ID,
  USDC_COIN_GECKO_ID,
  UST_COIN_GECKO_ID
]
export const BTC_COIN_GECKO_ID = 'bitcoin'
export const HIDDEN_BALANCE_DISPLAY = '********'
export const SMALL_BALANCE_THRESHOLD = '10'
export const LOW_VOLUME_MARKET_THRESHOLD = 1000

export const ONE_IN_BASE = new BigNumberInBase(1)
export const USDT_DECIMALS = 6
export const UI_DEFAULT_PAGINATION_LIMIT_COUNT = 20
export const UI_MINIMAL_ABBREVIATION_FLOOR = 1_000_000

export const MARKETS_HISTORY_CHART_SEVEN_DAYS = 154
export const MARKETS_HISTORY_CHART_ONE_HOUR = 60

export const TRADE_FORM_PRICE_ROUNDING_MODE = BigNumber.ROUND_HALF_UP
export const TRADE_FORM_QUANTITY_ROUNDING_MODE = BigNumber.ROUND_DOWN

export const BINANCE_DEPOSIT_ADDRESSES = [
  'inj1u2rajhqtptzvu23leheta9yg99k3hazf4waf43'
]

export const TRADE_MAX_SUBACCOUNT_ARRAY_SIZE = 100

export const MAX_SYMBOL_LENGTH = 6
export const SYMBOL_DISPLAY_LENGTH = 3

export const GST_MINIMUM_GRIDS = 3
export const GST_MAXIMUM_GRIDS = 50
export const GST_MIN_TRADING_SIZE = 5
export const GST_GRID_THRESHOLD = 10
export const GST_DEFAULT_AUTO_GRIDS = 20
export const GST_DEFAULT_PRICE_TICK_SIZE = '0.001'

export const GST_ROUTE = 'trading-bots-grid-spot'

// Campaign
export const CAMPAIGN_ID = IS_TESTNET // no campaign for devnet
  ? 'spot-grid-inj-usdt-test'
  : 'spot-grid-tia-usdt'
// we will read this from the contract later once its ready
export const CAMPAIGN_INJ_REWARDS = '1000'
export const CAMPAIGN_TIA_REWARDS = '10000'
// Guild
export const GUILD_CONTRACT_ADDRESS = IS_MAINNET
  ? 'inj1tej4n683z7l4wqnngjxyc5vf8p589d08mc23pa'
  : IS_TESTNET
  ? 'inj1hasnh2e0eqzyzh02wrgufuq40ptu0d037tuc3r'
  : 'inj1h4fu6dq4lafxme6gnke5s44rsjjaxu276458r2' // devnet
export const GUILD_ENCODE_KEY = 'guild'
export const GUILD_HASH_CHAR_LIMIT = 6
// todo: update later when indexer adds base and quote denom to the api
export const GUILD_QUOTE_TOKEN_SYMBOL = 'USDT'
export const GUILD_BASE_TOKEN_SYMBOL = IS_DEVNET ? 'INJ' : 'TIA'
export const GUILD_DISCORD_LINK =
  'https://discord.com/channels/739552603322450092/1172055840606400563'
export const GUILD_ZENDESK_LINK =
  'https://helixapp.zendesk.com/hc/en-us/articles/8336183812751-Announcing-Helix-Guilds'

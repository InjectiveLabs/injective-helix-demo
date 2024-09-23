import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { IntervalOption } from '@/types'

export * from './setup'
export * from './campaign'

export const UI_ZERO_DECIMAL = 0
export const UI_DEFAULT_MIN_DISPLAY_DECIMALS = 2
export const UI_DEFAULT_DISPLAY_DECIMALS = 4
export const UI_DEFAULT_LOW_PRICE_DISPLAY_DECIMALS = 9
export const UI_DEFAULT_MAX_DISPLAY_DECIMALS = 6
export const UI_DEFAULT_PRICE_DISPLAY_DECIMALS = 4
export const UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS = 4
export const UI_DEFAULT_AGGREGATION_DECIMALS = 3
export const UI_DEFAULT_FUNDING_RATE_DECIMALS = 5
export const UI_DEFAULT_AGGREGATION_DECIMALS_STRING = '3'
export const UI_DEFAULT_BINARY_OPTIONS_PRICE_DECIMALS = 4
export const UI_DEFAULT_TOKEN_ASSET_DECIMALS = 8
export const UI_DEFAULT_MAX_NUMBER_OF_ORDERS = 20

export const UI_DEFAULT_PRICE_MIN_DECIMALS = 10
export const UI_DEFAULT_PRICE_MAX_DECIMALS = 0.00001

export const UI_ORDERBOOK_AGGREGATED_BUY_KEY = '-1'
export const UI_ORDERBOOK_AGGREGATED_SELL_KEY = '-1'
export const UI_MINIMAL_AMOUNT = new BigNumber(1).shiftedBy(
  -UI_DEFAULT_MIN_DISPLAY_DECIMALS
)
export const MAX_QUOTE_DECIMALS = 3
export const MAX_QUOTE_TENS_MULTIPLIER = 3
export const UI_MAX_PAGINATION_LIMIT_COUNT = 50

export const BIG_NUMBER_ROUND_HALF_UP_MODE = BigNumber.ROUND_HALF_UP
// 6 gwei for Kovan, fetched from gasStation for Mainnet
export const DEFAULT_PRICE_WARNING_DEVIATION = new BigNumber(0.05) // 5%
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
  USDC_COIN_GECKO_ID
]
export const BTC_COIN_GECKO_ID = 'bitcoin'
export const HIDDEN_BALANCE_DISPLAY = '********'
export const SMALL_BALANCE_THRESHOLD = '10'
export const LOW_VOLUME_MARKET_THRESHOLD = 1000

export const ONE_IN_BASE = new BigNumberInBase(1)
export const USDT_DECIMALS = 6
export const UI_DEFAULT_PAGINATION_LIMIT_COUNT = 10
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

export const DUST_AMOUNT_THRESHOLD = 1

export const GST_MINIMUM_GRIDS = 3
export const GST_MAXIMUM_GRIDS = 150
export const GST_MIN_TRADING_SIZE = 5
export const GST_MIN_TRADING_SIZE_LOW = 1
export const GST_GRID_THRESHOLD = 10
export const GST_DEFAULT_AUTO_GRIDS = 20
export const GST_DEFAULT_PRICE_TICK_SIZE = '0.001'
export const GST_SINGLE_SIDED_THRESHOLD = 0.01
export const GST_KAVA_SINGLE_SIDED_THRESHOLD = 0.005
export const GST_STABLE_LOWER_PRICE = '0.999'
export const GST_STABLE_UPPER_PRICE = '1.001'
export const GST_STABLE_LOWER_PERCENTAGE = '0.99'
export const GST_STABLE_UPPER_PERCENTAGE = '1.01'
export const GST_STABLE_GRIDS = 3
export const GST_AUTO_PRICE_THRESHOLD = 2

export const GST_ROUTE = 'trading-bots-grid-spot'

export const DEFAULT_LP_ROUND = '1'
export const USDT_TOKEN_DECIMALS = 6
export const MAINNET_UPGRADE_BLOCK_HEIGHT = 57076000
export const POST_ONLY_MODE_BLOCK_THRESHOLD = 2000

export const ADMIN_UI_SMART_CONTRACT =
  'inj1xufs3ggc9styawwhfp23q9jz7kxmm7tek8yflk'

export const ORDERBOOK_ROW_HEIGHT = 16
export const ORDERBOOK_ROWS = 15
export const ORDERBOOK_HEADER_HEIGHT = 56
export const MAXIMUM_LEADERBOARD_STATS_RANK = 100
export const MAXIMUM_RANKED_TRADERS = 500
export const MIN_LEADERBOARD_TRADING_AMOUNT = 50
export const intervalOptions: IntervalOption[] = [
  { label: '1m', value: { countback: 30 * 32, resolution: 1 } },
  { label: '5m', value: { countback: 30 * 32, resolution: 5 } },
  { label: '15m', value: { countback: 30 * 32, resolution: 15 } },
  { label: '30m', value: { countback: 30 * 32, resolution: 30 } },
  { label: '1h', value: { countback: 30 * 32, resolution: 60 } },
  { label: '2h', value: { countback: 30 * 16, resolution: 120 } },
  { label: '4h', value: { countback: 30 * 10, resolution: 240 } },
  { label: '12h', value: { countback: 30 * 10, resolution: 720 } },
  { label: '1D', value: { countback: 30 * 10, resolution: 1440 } }
]
export const LEGACY_MARKET_IDS = [
  '0xac938722067b1dfdfbf346d2434573fb26cb090d309b19af17df2c6827ceb32c',
  '0xb9a07515a5c239fcbfa3e25eaa829a03d46c4b52b9ab8ee6be471e9eb0e9ea31',
  '0x1bba49ea1eb64958a19b66c450e241f17151bc2e5ea81ed5e2793af45598b906'
]

export const SGT_STABLE_COINS = ['USDTkv', 'STINJ'].map((symbol) =>
  symbol.toLowerCase()
)

export const CURRENT_MARKET_TO_LEGACY_MARKET_ID_MAP = {
  // SOL - SOLlegacy
  '0xd9089235d2c1b07261cbb2071f4f5a7f92fa1eca940e3cad88bb671c288a972f':
    '0xac938722067b1dfdfbf346d2434573fb26cb090d309b19af17df2c6827ceb32c',
  // WMATIC - WMATIClegacy
  '0x8cd25fdc0d7aad678eb998248f3d1771a2d27c964a7630e6ffa5406de7ea54c1':
    '0xb9a07515a5c239fcbfa3e25eaa829a03d46c4b52b9ab8ee6be471e9eb0e9ea31',
  // ARB - ARBlegacy
  '0x1c2e5b1b4b1269ff893b4817a478fba6095a89a3e5ce0cccfcafa72b3941eeb6':
    '0x1bba49ea1eb64958a19b66c450e241f17151bc2e5ea81ed5e2793af45598b906'
} as Record<string, string>

export const LEGACY_MARKET_TO_CURRENT_MARKET_ID_MAP = Object.entries(
  CURRENT_MARKET_TO_LEGACY_MARKET_ID_MAP
).reduce(
  (acc, [current, legacy]) => {
    acc[legacy] = current
    return acc
  },
  {} as Record<string, string>
)

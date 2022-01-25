import faq from './faq/en'
import dmm from './dmm/en'

export default {
  ...faq,
  ...dmm,
  address_copied: 'Address Copied',
  copy_address: 'Copy Address',
  max: 'Max',
  min: 'Min',
  cancel: 'Cancel',
  confirm: 'Confirm',
  injective: 'Injective',
  not_connected: 'Not Connected',
  connect: 'Connect',
  connect_to_wallet: 'Connect to wallet',
  connected: 'Connected',
  metamask: 'Metamask',
  spot_markets: 'Spot Markets',
  welcome_to_ip:
    'Access, create and trade unlimited decentralized finance markets',
  welcome_to_ip_sub:
    'The Canary Chain has a $5,000 trading limit which will be uplifted upon the canonical release over the coming weeks.',
  maintenance_header: 'Ongoing Maintenance',
  maintenance_subheader:
    'While this relayer is down for maintenance, the <strong class="text-primary-500">Injective Chain</strong> is never down! You can find other relayers in the Injective Ecosystem on the button below!',
  maintenance_button: 'Relayers',
  maintenance_body: '',
  token_allowance_successful: 'Token allowance set successful',
  logout: 'Logout',
  success_connect: 'Successfully Connected',
  market: 'Market',
  last_traded_price: 'Last Traded Price',
  last_traded_price_tooltip: 'The last price at which a trade occurred.',
  market_change_24h: 'Change (24h)',
  total_market_volume_24h: 'Total Volume (24H)',
  market_change_24h_tooltip: 'The change in price over the past 24 hours.',
  market_volume_24h: 'Volume (24h)',
  market_volume_24h_tooltip: 'The total trade volume over the past 24 hours.',
  filter_markets: 'Filter Markets',
  filter_by_market: 'Filter by market',
  spot: 'Spot',
  subaccount_funds_available: 'Trading Account Funds',
  asset: 'Asset',
  balance: 'Balance',
  available: 'Available',
  deposit: 'Deposit',
  withdraw: 'Withdraw',
  transfer: 'Transfer',
  not_connected_balances: 'Connect your wallet to see your balances.',
  not_connect_orders: 'Connect your wallet to see your orders.',
  not_connect_trades: 'Connect your wallet to see your trades.',
  not_connected_trading: 'Connect your wallet to start trading',
  order_book: 'Orderbook',
  average_price: 'Average price',
  total_volume_in_quote: 'Volume in {symbol}',
  total_volume_in_base: 'Volume in {symbol}',
  sum: 'Sum',
  price: 'Price',
  amount: 'Amount',
  total: 'Total',
  type: 'Type',
  side: 'Side',
  buy: 'Buy',
  sell: 'Sell',
  order_success_canceling: 'Order Cancelled',
  actions: 'Actions',
  trades: 'Trades',
  time: 'Time',
  size: 'Size',
  notional_value: 'Notional Value',
  fee: 'Fee',
  direction: 'Direction',
  execution_type: 'Execution Type',
  open_orders: 'Open Orders',
  trade_history: 'Trade History',
  trading: 'Trading',
  buy_asset: 'Buy {asset}',
  sell_asset: 'Sell {asset}',
  long_asset: 'Long {asset}',
  short_asset: 'Short {asset}',
  limit: 'Limit',
  limit_buy: 'Limit Buy',
  limit_sell: 'Limit Sell',
  market_buy: 'Market Buy',
  market_sell: 'Market Sell',
  limit_long: 'Limit Long',
  limit_short: 'Limit Short',
  market_long: 'Market Long',
  market_short: 'Market Short',
  not_enough_fillable_orders: 'There are not enough orders to fill this amount',
  amount_decimals:
    'Amount <small style="opacity: 0.75;">({decimals} decimals)</small>',
  price_decimals:
    'Price <small style="opacity: 0.75;">({decimals} decimals)</small>',
  place_order: 'Place {type} order',
  order_placed: 'Your order has been placed',
  error_in_form: 'There are errors in your form',
  high_asset: 'High ({asset})',
  low_asset: 'Low ({asset})',
  volume_asset: '24h Volume ({asset})',
  high: '24h High',
  low: '24h Low',
  volume: 'Volume',
  price_chart: 'Price Chart',
  filled: 'Filled',
  cancel_order: 'Cancel Order',
  please_connect_to_your_wallet:
    'Please connect to your wallet to see more details',
  please_connect_to_your_wallet_cta:
    'Please connect to your wallet to start trading on Injective!',
  amount_to_transfer: 'Amount to transfer',
  available_balance: 'Available Balance',
  transfer_modal_title: 'Deposit to Injective Chain',
  transfer_modal_note:
    "Trading on our Layer-2 Injective Chain requires you to transfer your balance to our Injective Chain. First, set allowance to the asset you want to transfer (if you haven't already), enter desired amount and complete your transfer",
  deposit_modal_title: 'Deposit to Subaccount',
  deposit_modal_note:
    'Your trading experience starts once you deposit your funds from the Injective Chain to your trading account.',
  take_out_modal_title: 'Withdraw from Injective Chain',
  take_out_modal_note:
    'You can choose to withdraw your assets from the Injective Chain by filling up the form below',
  withdraw_modal_title: 'Withdraw from Subaccount',
  withdraw_modal_note:
    'You can always withdraw your funds back to the Injective Chain, so you can interact with the rest of the functionalities on the Injective Chain',
  transfer_asset: 'Deposit {asset}',
  deposit_asset: 'Deposit {asset}',
  withdraw_asset: 'Withdraw {asset}',
  take_out_asset: 'Withdraw {asset}',
  allowance_set: 'Allowance Set',
  set_allowance: 'Set Allowance',
  set_allowance_asset: 'Set Allowance for {asset}',
  success_transfer: 'Successfully Deposited',
  success_transfer_assets: 'Successfully Transferred',
  trade_placed: 'Trade placed',
  success_deposit: 'Successfully Deposited',
  success_withdraw: 'Successfully Withdrawn',
  injective_chain_balance: 'Injective Chain Balances',
  balance_asset: 'Balance {asset}',
  unfilled: 'Unfilled',
  derivatives: 'Derivatives',
  long: 'Long',
  short: 'Short',
  max_leverage: 'Max Leverage:  {max}',
  margin: 'Margin',
  liquidation_price: 'Liquidation Price',
  positions: 'Positions',
  close_position: 'Close Position',
  entry_price: 'Entry Price',
  unrealized_pnl: 'Unrealized PnL',
  unrealized_pnl_tooltip:
    'The unrealized PnL is an approximation of the realized profit or loss if the position was to be closed.',
  leverage: 'Leverage',
  not_available_n_a: 'N/A',
  position_closed: 'Position Closed',
  all_position_closed: 'All Positions Closed',
  not_enough_balance: 'Not enough balance',
  reduce_only: 'Reduce Only',
  reduce_only_in_excess:
    'Total size of reduce-only orders would exceed size of your position',
  reduce_only_exceed_position:
    'Total size of reduce-only orders exceed the size of your position',
  worst_price_note:
    'Note: If the execution price exceeds the {slippage}% slippage protection, your order will be automatically cancelled',
  max_leverage_warn: 'Please decrease leverage.',
  next_funding: 'Next Funding',
  next_funding_tooltip:
    'The time remaining for the end of the funding interval.',
  expiry_date: 'Expiry Date',
  days: 'Days',
  funding_fee: 'Funding fee',
  funding_rate: 'Funding Rate',
  est_funding_rate: 'Est. Funding Rate',
  funding_rate_tooltip:
    'The interest rate paid is determined by the difference between the perpetual swap price and the underlying spot price. If the funding rate is positive, traders with long positions will pay traders with short positions. If the funding rate is negative, traders with short positions will pay those in long positions.',
  est_receiving_amount: 'Est. Receiving Amount (Worst Case)',
  est_receiving_amount_note:
    'The lowest amount you can actually receive for the trade.',
  est_fee_rebate: 'Est. Fee Rebate',
  est_fee_rebate_note:
    'The estimated rebate is the rebate that is granted if the limit order is filled as a maker order.',
  fee_order_details_note:
    "Trading fees associated with the trade. If your limit order doesn't get filled as a taker order, you will only need to pay {feeReturned} in fees.",
  fee_order_details_note_negative_margin:
    "Trading fees associated with the trade. If your limit order doesn't get filled as a taker order, you are not going to pay any trading fees.",
  buy_long: 'Buy/Long',
  sell_short: 'Sell/Short',
  mark_price: 'Mark Price',
  mark_price_tooltip: 'The oracle price for the base asset.',
  select_ledger_address: 'Select Ledger Address',
  follow_instructions: 'Please follow the instructions on your device',
  address: 'Address',
  select_address_to_connect: 'Select Address to Connect',
  derivation_path: 'Derivation Path',
  select_derivation_path: 'Select Derivation Path',
  get_addresses: 'Get Addresses',
  get_more_addresses: 'Get More Addresses',
  please_wait_addresses: 'We are getting your addresses, please wait ...',
  ledger_live: 'Ledger Live',
  ledger_legacy: 'Ledger Legacy',
  cancel_all: 'Cancel All',
  close_all: 'Close All',
  orders_cancelled: 'Orders Cancelled',
  yes: 'Yes',
  no: 'No',
  not_valid_number: 'Not a valid number',
  mark_price_invalid: 'The mark price is not valid',
  order_insufficient_margin: 'Order has insufficient margin',
  date: 'Date',
  small_bridge_fee_note: 'Bridge fee: {fee} {asset}',
  small_gas_fee_note: 'Gas: {fee} {asset}',
  add_margin_to_position_title: 'Add Margin',
  add_margin_to_position_note:
    'You can increase the margin your position has to prevent liquidation',
  add_margin: 'Add Margin',
  success_added_margin: 'You have successfully added margin to your position',
  no_liquidity: 'Not enough Liquidity',
  close_auto_liquidation:
    'Closing this position with the current market depth would result in auto-liquidation.',
  execution_price_surpasses_bankruptcy_price:
    'Execution price surpasses the bankruptcy price',
  you_can_only_have_max_orders:
    'You can only have {number} orders per side per market per trading account',
  transfer_on_chain_title: 'Transfer on Injective Chain',
  transfer_on_chain_note:
    'Transfer your assets to an address on the Injective Chain',
  select_asset: 'Select Asset',
  destination: 'Destination',
  disclaimer_note:
    'By connecting a wallet, you agree to the Injective Labs <a href="https://injectivelabs.org/terms-and-conditions" class="text-primary-500" target="_blank" />Terms and Conditions</a>, have read the <a href="https://injectivelabs.org/privacy-policy" class="text-primary-500" target="_blank" />Privacy Policy</a> and acknowledge that you have read and understand the Injective Protocol <a href="https://injectiveprotocol.com/disclaimer" class="text-primary-500" target="_blank">disclaimer</a>.',
  transfer_wait_time_note:
    'Note: It should take around 4 minutes for your transfer to appear after your transaction has been confirmed on Ethereum.',
  orderbook_liquidity_cannot_satisfy:
    'Orderbook liquidity cannot satisfy the worst price for the specified amount',
  order_price_low_warn: 'Order price is too low',
  order_price_high_warn: 'Order price is too high',
  'Connect using Ledger': 'Connect using Ledger',
  'Connect using Ledger instructions':
    'Note: To ensure smooth process while connecting your Ledger Hardware Wallet, please ensure you are running the on latest Chrome version, have your Ledger device connected, unlocked and your Ethereum app open. ',
  high_price_deviation_warning:
    'You have previously turned on the warning notification for high price deviations. Click confirm if you agree to turn off this warning.',
  high_execution_price_deviation_warning_note:
    'The execution price for your order deviates at least {percentage}% than the last traded price. Click confirm if you still want to execute it.',
  high_execution_price_deviation_warning:
    'Your execution price deviates at least {percentage}% from the latest market price.',
  cancel_and_save_preference: 'Cancel and Save Preference',

  home: 'Home',
  open: 'Open',
  'Trezor Connection Note':
    "Note: At this point there is no support for Trezor - please don't use Trezor (including Metamask's Trezor integration) as it might cause your funds being stuck on the Injective Chain.",
  close: 'Close',
  'Connect using browser wallet': 'Connect using browser wallet',
  'Connect to Wallet': 'Connect to Wallet',
  Ledger: 'Ledger',
  'Select address to connect': 'Select address to connect',
  'Please follow the instructions on your device':
    'Please follow the instructions on your device',
  'Ledger Live': 'Ledger Live',
  'Ledger Legacy': 'Ledger Legacy',
  'Connect using hardware wallet': 'Connect using hardware wallet',
  'Get addresses': 'Get addresses',
  'Get more addresses': 'Get more addresses',
  'We are getting your addresses, please wait ...':
    'We are getting your addresses, please wait ...',
  'Select Derivation Path': 'Select Derivation Path',
  'Derivation Path': 'Derivation Path',
  'Select Address': 'Select Address',
  'Select Ledger Address': 'Select Ledger Address',
  'There are no results found - Markets':
    'There are no markets found. You can go ahead and propose some!',
  balances: 'Balances',
  'Injective Chain': 'Injective Chain',
  Subaccount: 'Trading Account',
  subaccount_tooltip:
    'The available funds on your trading account. In order to trade, you must transfer funds from the Injective Chain to your trading account.',
  injective_chain_tooltip: 'Your available funds on the Injective Chain',
  'available_total_subaccount_balance Tooltip':
    'Your trading account available/total balance',
  'Deposit to Injective Chain': 'Deposit to Injective Chain',
  'Deposit to Subaccount': 'Deposit to your Trading Account',
  'Available for Deposit': 'Available for Deposit',
  'Available for Deposit Tooltip':
    'The amount of {asset} you can deposit on the Injective Chain.',
  'Enter your amount': 'Enter your amount',
  'Withdraw from Injective Chain': 'Withdraw from Injective Chain',
  'Withdraw from Subaccount': 'Withdraw from Trading Account',
  Deposit: 'Deposit',
  'Available to Withdraw': 'Available to Withdraw',
  'Available to Withdraw Tooltip':
    'The amount of {asset} you can withdraw from the Injective Chain.',
  'Available to Withdraw Subaccount Tooltip':
    'The amount of {asset} you can withdraw from your Trading Account.',
  Orderbook: 'Orderbook',
  Cancel: 'Cancel',
  Close: 'Close',
  open_positions: 'Open Positions',
  getting_started: 'Getting Started',
  perp: 'Perp',
  futures: 'Futures',
  perpetuals: 'Perpetuals',
  spots: 'Spot',
  markets: 'Markets',
  Portfolio: 'Portfolio',
  open_derivatives_order: 'Open Derivative Orders',
  open_spot_order: 'Open Spot Orders',
  'Transfer Assets Now': 'Transfer Assets Now',
  Restrictions: 'Restrictions',
  Languages: 'Languages',
  all: 'All',
  derivatives_trade_history: 'Derivatives Trade History',
  spot_trade_history: 'Spot Trade History',
  wallet_history: 'Wallet History',
  subaccount_transfer_history: 'Trading Account Transfer History',
  History: 'History',
  Wallet: 'Wallet',
  deposits: 'Deposits',
  download: 'Download',
  withdrawals: 'Withdrawals',
  subaccount: 'Trading Account',
  'Injective Chain Balance': 'Injective Chain Balance',
  'ERC20 Balance': 'ERC20 Balance',
  Balances: 'Balances',
  Asset: 'Asset',
  'Join our Ecosystem now': 'Join the Injective Ecosystem!',
  'There are no results found - Balances':
    'We cannot find any token balances for your address',
  'Ready to get started?': 'Injective Bridge',
  'Cta Note':
    'Transfer assets to Injective and experience lightning fast speeds, zero gas fees and a world of unlimited DeFi Markets.',
  'Available Margin': 'Available Margin',
  'Available Margin Tooltip':
    'The available margin you can add to this position',
  'Confirm order execution': 'Confirm order execution',
  liquidation_price_tooltip:
    'The price at which your position will be liquidated or force-exited to prevent further losses.',
  fees_tooltip:
    'Trading fees associated with the trade. Trading fees on Injective can be lowered using rebates.',
  notional_value_tooltip:
    'The total value of the position which is determined by the mark price with the following formula: Mark Price * Base Asset Amount.',
  margin_tooltip: 'The total margin required to execute the trade.',
  portfolio_value: 'Portfolio value',
  portfolio_value_tooltip:
    'Your total portfolio value represented in USD. This includes all of your holdings on the Injective Chain, including bank module balances, balances across your trading accounts, open orders total value and unrealized PnL.',
  start_trading: 'Start Trading Now',
  available_margin: 'Available Margin',
  available_margin_tooltip: 'Your total available margin for trading.',
  margin_hold: 'Margin Hold',
  margin_hold_tooltip:
    'The amount of margin you have in your open orders and positions.',
  assets_value: 'Assets Value',
  assets_value_tooltip: 'The total value of your assets in the bank module.',
  unrealized_pnl_portfolio: 'Unrealized PnL',
  unrealized_pnl_portfolio_tooltip:
    'The unrealized PnL is an approximation of the realized profit or loss if the position was to be closed.',
  total_potential: 'Total Value',
  total_potential_tooltip:
    'An approximate total value of your stable coins (USDT, USDC, etc) balances and any unrealized PnL you currently have.',
  side_tooltip: 'The side of your trade: long or short',
  amount_tooltip:
    'The total value of the base asset at the time which the trade was executed (i.e. for BTC/USDT, BTC is the base asset and USDT is the quote asset).',
  execution_type_tooltip: 'The type of your order: limit or market.',
  time_tooltip:
    "The time at which the trade was executed (times are shown in your browser's timezone).",
  recent_news: 'Recent news',
  injective_home_title_1: 'Injective eliminates all barriers to trading',
  injective_home_title_2: 'Join a global community',
  injective_home_subtitle_1:
    'Access unlimited DeFi markets. With Injective, you can trade any financial market on the first fast, cross-chain, low fee, secure, and fully decentralized derivatives exchange protocol. ',
  injective_home_subtitle_2:
    'Injective is governed entirely by the community.  Early adopters are encouraged to learn more about Injective products, connect with other community members, and have your say in shaping the future of the protocol.',
  gas_fees: 'Gas Fees',
  Total: 'Total',
  Twitter: 'Twitter',
  Reddit: 'Reddit',
  Discord: 'Discord',
  Youtube: 'Youtube',
  Telegram: 'Telegram',
  transfer_on_chain: 'Transfer on Injective',
  'Successfully Transferred': 'Successfully Transferred',
  'Enter amount': 'Enter amount',
  'Available to Transfer On Chain': 'Available to Transfer On Injective',
  'Available to Transfer On Chain Tooltip':
    'The available amount you can transfer to another address on the Injective Chain',
  'Asset Transfer': 'Asset Transfer',
  'Asset Transfer Tooltip': 'The asset you want to transfer',
  'Injective Address Destination': 'Destination',
  'Injective Address Destination Tooltip':
    'The destination injective address you want to sent the assets to',
  'Buffer for gas note':
    'Note: You have to leave a small amount of INJ in your Injective Chain balance to pay for the gas fees when required.',
  'Acknowledge Terms': 'Acknowledge Terms',
  acknowledge_title:
    'In addition, you hereby represent, warrant, and agree that: ',
  acknowledge_1:
    'You are not a person or company who is a resident of, is located, incorporated, or has a registered agent in, the United States of America or a Restricted Territory (as defined in the T&C).',
  acknowledge_2:
    'You will not in the future access this site or use Injective.Exchange while located in the United States of America or a Restricted Territory.',
  acknowledge_3:
    'You are not using, and will not in the future use, a virtual private network or other means to mask your physical location from a Restricted Territory.',
  acknowledge_4:
    'You are lawfully permitted to access this site and trade on Injective.Exchange under the laws of the jurisdiction in which you reside and are located.',
  acknowledge_5:
    'You understand the risks associated with using leverage, entering into perpetual contracts, and trading in digital assets.',
  'Fee Discounts': 'Fee Discounts',
  tier: 'Tier',
  staked_amount: 'Staked Amount',
  fees_paid: 'Fees Paid',
  maker_fee_discount: 'Maker Fee Discount',
  taker_fee_discount: 'Taker Fee Discount',
  'My Tier': 'My Tier',
  'My Tier Tooltip':
    'The fee tier you currently hold on Injective based on your INJ staked amount and fees paid on the protocol in the current epoch. You can see a full breakdown of the tiers in the table below.',
  'My Staked Amount': 'Staked Amount',
  'My Staked Amount Tooltip':
    'The amount of INJ that you have staked. Staking INJ secures the protocol, earns you rewards and can help you obtain a more preferable fee tier.',
  'My Fee Paid Amount': 'Total Fees Paid',
  'My Fee Paid Amount Tooltip':
    'The total fees you have paid on Injective during the current epoch. You pay fees during trades and traders on the protocol. The amount of fees paid helps determine your fee tier.',
  'My Maker/Taker Discount': 'Maker/Taker Rate Discount',
  'My Maker/Taker Discount Tooltip':
    'Your current trading fee discount based on your fee tier.',
  portfolio_summary: 'Portfolio Summary',
  subaccount_holdings: 'Trading Account Holdings',
  faq: 'FAQ',
  fee_discounts_footer: 'Fee Discounts',
  'Privacy Policy': 'Privacy Policy',
  'Terms & Conditions': 'Terms & Conditions',
  'Frequently Asked Questions': 'Frequently Asked Questions',
  'Search for FAQs': 'Search for FAQs',
  'faq-category-All': 'All',
  'faq-category-General': 'General',
  available_subaccount_balance_tooltip:
    'The available balance you can use in your trading account, excluding the balance that is used in trades (orders or positions).',
  total_subaccount_balance_tooltip:
    'The total balance in your trading account.',
  and: 'and',
  fee_discount_staked_amount: 'Staked Amount',
  fee_discount_staked_amount_tooltip:
    'The amount of INJ required to be staked. Staking INJ secures the protocol, earns rewards and can help obtain a more preferable fee tier.',
  fee_discount_fees_paid: 'Total Fees Paid',
  fee_discount_fees_paid_tooltip:
    'The total fees required to be paid on Injective. Fees are paid to execute trades on the protocol. The amount of fees paid helps determine the fee tier. The total fees collected are summed up on a 30 day rolling basis period.',
  fee_discount_maker: 'Maker Rate Discount',
  fee_discount_maker_tooltip: 'Maker fee discount based on the fee tier.',
  fee_discount_taker: 'Taker Rate Discount',
  fee_discount_taker_tooltip: 'Taker fee discount based on the fee tier.',
  'Current Epoch': 'Current Epoch',
  'Past Epoch': 'Past Epoch',
  Rewards: 'Rewards',
  resources: 'Resources',
  calculator: 'Calculator',
  'Trade & Earn': 'Trade & Earn',
  trading_fee_to_date: 'Trading fee to date',
  trading_fee_to_date_tooltip: 'Trading fee to date tooltip',
  current_epoch: 'Current Epoch',
  current_epoch_tooltip: 'Current Epoch tooltip',
  est_rewards: 'Est. Rewards',
  est_rewards_tooltip:
    'Estimated reward to be distributed to this address based on your reward points /  total reward points * total allocated rewards. This is calculated assuming that your reward points grow just as fast as total reward points until the end of the campaign.  In order to maintain or maximize your reward, you should maintain the same or higher trading activity until the end of the campaign. Rewards amount is capped at {maxRewards} INJ or the equivalent amount of INJ staked, whichever is higher',
  reward_points: 'My Reward Points Earned',
  reward_points_tooltip:
    'The current reward points you earned during this campaign. Reward points will reset to 0 at the beginning of next campaign.',
  total_reward_points: 'Total Reward Points',
  total_reward_points_tooltip:
    'The current total reward points collected by all addresses on Injective in this campaign. This number will grow until the end of campaign.',
  countdown_campaign: 'Campaign end time',
  countdown_campaign_tooltip:
    'Date and time when the current campaign ends (shown in the timezone of your browser). Any reward point earned after the countdown will be counted toward the next campaign.',
  reward_earned_up_to_date: 'Rewards earned up to date',
  reward_earned_up_to_date_tooltip: 'Rewards earned up to date tooltip',
  market_total_tooltip:
    'This total is calculated based on the approximated price you are going to get when execution the trade. Please note that the Total you end up with might have a slight deviation from the value shown here, as slippage is also applied on the execution price.',
  fees_tooltip_discount:
    'Based on your tier, you are eligible for {maker}% maker discount and {taker}% taker discount.',
  remaining: 'remaining',
  campaign_duration: 'Campaign Duration',
  campaign_duration_tooltip:
    'The duration of this campaign. A new campaign will start immediately after the previous campaign until 2026.',
  max_campaign_rewards: 'Total allocated Rewards',
  max_campaign_rewards_tooltip:
    'The total number of INJ that will be distributed in this epoch. Reward distribution will happen at the end of the vesting period after each campaign is finished.',
  fee_paid_amount: 'Fee Paid Amount',
  fee_paid_amount_tooltip: 'Fee Paid Amount tooltip',
  'Markets Information': 'Markets Information',
  quote_denoms: 'Quote Denoms',
  quote_denoms_tooltip:
    'Markets involving these assets are qualified for Trade & Earn unless explicitly disqualified otherwise (check disqualified markets). Whether that be a derivatives market using these assets as margin, or a spot market using these assets as either base or quote currency.',
  boosted_markets: 'Market Rewards',
  boosted_markets_tooltip:
    'The reward rate for taker and maker orders in each market. For example: 3x maker pts means that trading fees paid by maker orders in this market will receive reward points equal to 3 times the value of trading fees.',
  disqualified_markets: 'Disqualified Markets',
  disqualified_markets_tooltip:
    'Markets that are disqualified from Trade & Earn. Trading activity in these markets will not earn any reward points.',
  maker_points_mul: 'maker pts',
  taker_points_mul: 'taker pts',
  pts: 'pts',
  switch_to_injective_address: 'Switch to Injective Address',
  switch_to_ethereum_address: 'Switch to Ethereum Address',
  maker_taker_rate: 'Maker/Taker Fee Rate',
  maker_taker_rate_note:
    'Maker/Taker fee rate for the current market. Can be lowered based on the fee discounts incentive program.',
  taker_rate: 'Taker Fee Rate',
  taker_rate_note:
    'Taker fee rate for the current market. Can be lowered based on the fee discounts incentive program.',
  expected_points: 'Expected Points',
  expected_points_note:
    'The expected points you will earn for the Injective Astro incentive program based on the execution type of your order (maker or taker).',
  your_order_has_high_price_deviation:
    'The execution price for this trade is far away from the current orderbook mid price.',
  execution_price_far_away_from_last_traded_price:
    'Please note that the execution price for this trade deviates a lot from the last traded price.',
  there_are_no_disqualified_markets_on_this_relayer:
    'There are no disqualified markets on this relayer.',
  liquidation: 'Liquidation',

  gas_fee_of_first_deposit_covered:
    'The gas fee of your first deposit is covered by Injective Pro!',
  read_more: 'Read more',
  deposit_zero_gas_fees: 'Get back the gas fee you paid for the first deposit',
  gas_fee_rebates_steps:
    'Receive a wETH rebate once you complete the following steps.',
  step_number: 'Step {number} of {total}',
  step_1_gas_fee_rebate:
    'Transfer {amount} USDT or more in a single transaction from Ethereum to the Injective Chain.',
  step_2_gas_fee_rebate:
    'Trade an aggregate amount of {amount} USDT or equivalent in any market of choice on the Injective Pro Relayer. You can either do it in one trade or in as many trades as you like.',
  redeem: 'Redeem',
  gas_fee_rebate_note:
    'The rebate is payable in wETH and there is a maximum cap of 0.05 wETH for each rebate. You can only receive this rebate once. If more than one transfer from Ethereum is detected, the first transfer of {amount} USDT or more will be used as the reference.',
  redeem_success:
    'You have successfully redeemed your gas fees rebate - check your wETH balance!',
  auction: {
    countdown: {
      title: 'First Injective Burn Countdown',
      button: 'Watch the Burn'
    }
  },
  terra: 'Terra',
  overview: 'Overview',
  subaccount_deposit_modal_note:
    'To get started with trading you need to deposit your funds from the Injective Chain balance to a dedicated trading account. Select the asset you want to transfer, enter the amount, deposit and start trading!',

  trade_and_earn_my_staked_amount: 'My Staked Amount',
  trade_and_earn_my_staked_amount_tooltip:
    'The default maximum rewards you can receive is capped at {maxRewards} INJ. You may increase this cap by staking more than {maxRewards} INJ and it will be the same level as your staked amount.',
  stake_more: 'Stake More',
  stake_now: 'Stake Now',
  'Successfully Staked': 'Successfully Staked',
  Delegate: 'Delegate',
  'Enter your amount to be delegated': 'Enter your amount to be delegated',
  'Available for Delegation': 'Available for Delegation',
  'Available for Delegation Tooltip':
    'The amount of INJ you have available for delegation.',
  'Delegate To {validator}': 'Delegate To {validator}',

  // 15.01.2022
  analytics: 'Analytics',

  tradeAndEarn: {
    pendingRewards: 'Pending Rewards',
    campaignEndsAt: 'Ends at {date}',
    campaignAsAt: 'As at {date}',
    myRewardPoints: 'My Reward Points / Total Reward Points',
    myRewardPoints_tooltip:
      'The current reward points you earned during this campaign and the total reward points in the campaign. Reward points will reset to 0 at the beginning of next campaign.',
    pending_max_campaign_rewards: 'Total allocated Rewards',
    pending_max_campaign_rewards_tooltip:
      'The total number of INJ that was distributed in the previous epoch. Reward distribution will happen at the end of the vesting period.',
    est_rewards_stake: 'Est. Rewards',
    est_rewards_stake_tooltip:
      'Estimated reward to be distributed to this address based on your reward points /  total reward points * total allocated rewards. This is calculated assuming that your reward points grow just as fast as total reward points until the end of the campaign.  In order to maintain or maximize your reward, you should maintain the same or higher trading activity until the end of the campaign. Rewards amount is capped at {maxRewards} INJ or the equivalent amount of INJ staked, whichever is higher',
    stake_total_to_receive_full_amount:
      'Stake total of {total} INJ to receive the full amount'
  }
}

import activities from './activities/en'
import banners from './banners/en'
import bridge from './bridge/en'
import faq from './faq/en'
import funding from './funding/en'
import home from './home/en'
import market from './market/en'
import wallet from './wallet/en'

export default {
  ...activities,
  ...banners,
  ...faq,
  ...funding,
  ...activities,
  ...home,
  ...market,
  ...bridge,
  ...wallet,
  common: {
    deposit: 'Deposit',
    trade: 'Trade',
    transfer: 'Transfer',
    value: 'Value',
    search: 'Search',
    withdraw: 'Withdraw',
    view: 'View'
  },
  address_copied: 'Address Copied',
  copy_address: 'Copy Address',
  cancel: 'Cancel',
  confirm: 'Confirm',
  injective: 'Injective',
  not_connected: 'Not Connected',
  connected: 'Connected',
  metamask: 'Metamask',
  welcome_to_ip:
    'Access, create and trade unlimited decentralized finance markets',
  welcome_to_ip_sub:
    'The Canary Chain has a $5,000 trading limit which will be uplifted upon the canonical release over the coming weeks.',
  maintenance_header: 'Ongoing Scheduled Maintenance',
  maintenance_subheader:
    'While this relayer is down for maintenance, the <strong class="text-primary-500">Injective Chain</strong> is never down! You can find other relayers in the Injective Ecosystem on the button below!',
  maintenance_button: 'Relayers',
  maintenance_body: '',
  token_allowance_successful: 'Token allowance set successful',
  logout: 'Logout',
  success_connect: 'Successfully Connected',
  trading: 'Trading',
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
  success_deposit: 'Successfully Deposited',
  success_withdraw: 'Successfully Withdrawn',
  injective_chain_balance: 'Injective Chain Balances',
  select_ledger_address: 'Select Ledger Address',
  follow_instructions: 'Please follow the instructions on your device',
  address: 'Address',
  cancel_all: 'Cancel All',
  close_all: 'Close All',
  orders_cancelled: 'Orders Cancelled',
  yes: 'Yes',
  no: 'No',
  not_valid_number: 'Not a valid number',
  date: 'Date',
  small_bridge_fee_note: 'Bridge fee: {fee} {asset}',
  small_gas_fee_note: 'Gas: {fee} {asset}',
  transfer_on_chain_title: 'Transfer on Injective Chain',
  transfer_on_chain_note:
    'Transfer your assets to an address on the Injective Chain',
  select_asset: 'Select Asset',
  destination: 'Destination',
  disclaimer_note:
    'By connecting a wallet, you agree to the Injective Labs <a href="https://injectivelabs.org/terms-and-conditions" class="text-primary-500" target="_blank" />Terms and Conditions</a>, have read the <a href="https://injectivelabs.org/privacy-policy" class="text-primary-500" target="_blank" />Privacy Policy</a> and acknowledge that you have read and understand the Injective Protocol <a href="https://injectiveprotocol.com/disclaimer" class="text-primary-500" target="_blank">disclaimer</a>.',
  transfer_wait_time_note:
    'Note: It should take around 4 minutes for your transfer to appear after your transaction has been confirmed on Ethereum.',
  'Connect using Ledger': 'Connect using Ledger',
  'Connect using Ledger instructions':
    'Note: To ensure smooth process while connecting your Ledger Hardware Wallet, please ensure you are running the on latest Chrome version, have your Ledger device connected, unlocked and your Ethereum app open. ',
  open: 'Open',
  close: 'Close',
  'Please follow the instructions on your device':
    'Please follow the instructions on your device',
  'Ledger Live': 'Ledger Live',
  'Ledger Legacy': 'Ledger Legacy',
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
  Cancel: 'Cancel',
  Close: 'Close',
  'Deposit to Subaccount': 'Deposit to your Trading Account',
  getting_started: 'Getting Started',
  'Transfer Assets Now': 'Transfer Assets Now',
  Restrictions: 'Restrictions',
  Languages: 'Languages',
  download: 'Download',
  'Injective Chain Balance': 'Injective Chain Balance',
  'ERC20 Balance': 'ERC20 Balance',
  'Join our Ecosystem now': 'Join the Injective Ecosystem!',
  'Ready to get started?': 'Injective Bridge',
  'Cta Note':
    'Transfer assets to Injective and experience lightning fast speeds, zero gas fees and a world of unlimited DeFi Markets.',
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
  'My Tier': 'My Tier',
  'My Tier Tooltip':
    'The fee tier you currently hold on Injective based on your INJ staked amount and fees paid on the protocol in the current epoch. You can see a full breakdown of the tiers in the table below.',
  'My Staked Amount': 'Staked Amount',
  'My Staked Amount Tooltip':
    'The amount of INJ that you have staked. Staking INJ secures the protocol, earns you rewards and can help you obtain a more preferable fee tier.',
  'My Fee Paid Amount': 'Total Fees Paid',
  'My Fee Paid Amount Tooltip':
    'The total fees you have paid on Injective during the current epoch. You pay fees during trades and traders on the protocol. The amount of fees paid helps determine your fee tier.',
  'Frequently Asked Questions': 'Frequently Asked Questions',
  'Search for FAQs': 'Search for FAQs',
  'faq-category-All': 'All',
  'faq-category-General': 'General',
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
  fees_tooltip_discount:
    'Based on your tier, you are eligible for {maker}% maker discount and {taker}% taker discount.',
  remaining: 'remaining',
  campaign_duration: 'Campaign Duration',
  campaign_duration_tooltip:
    'The duration of this campaign. A new campaign will start immediately after the previous campaign until 2026.',
  max_campaign_rewards: 'Total allocated Rewards',
  max_campaign_rewards_tooltip:
    'The total number of INJ that will be distributed in this epoch. Reward distribution will happen at the end of the vesting period after each campaign is finished.',
  maker_points_mul: 'maker pts',
  taker_points_mul: 'taker pts',
  pts: 'pts',
  switch_to_injective_address: 'Switch to Injective Address',
  switch_to_ethereum_address: 'Switch to Ethereum Address',

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
  tradeAndEarn: {
    pendingRewards: 'Pending Rewards',
    campaignEndingOn: 'Ending on {date}',
    campaignAsOf: 'As of {date}',
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
  },

  marketBeta: {
    title: 'Acknowledge the risk of trading on the market',
    'I Understand': 'I Understand',
    beta: 'beta',
    description:
      'This market is in the Beta phase. During this phase, typically there is no great depth in the order book. This means slippage may be applied when you make a trade.'
  },

  navigation: {
    balances: 'Balances',
    funding: 'Funding',
    disconnect: 'Disconnect',
    myAccount: 'My Account',
    connectedWallets: 'Connected Wallets',
    connected: 'Connected',
    referral: 'Referral',
    rewards: 'Rewards',
    dashboard: 'Dashboard',
    trade: 'Trade',
    activities: 'Activities',
    home: 'Home'
  }
}

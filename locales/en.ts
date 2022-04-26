import activities from './activity/en'
import banners from './banners/en'
import bridge from './bridge/en'
import faq from './faq/en'
import funding from './portfolio/en'
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
    available: 'Available',
    deposit: 'Deposit',
    trade: 'Trade',
    transfer: 'Transfer',
    value: 'Value',
    search: 'Search',
    withdraw: 'Withdraw',
    view: 'View',
    cancel: 'Cancel',
    confirm: 'Confirm',
    ok: 'OK',
    open: 'Open',
    close: 'Close',
    required: 'Required'
  },
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
  disclaimer_note:
    'By connecting a wallet, you agree to the Injective Labs <a href="https://injectivelabs.org/terms-and-conditions" class="text-primary-500" target="_blank" />Terms and Conditions</a>, have read the <a href="https://injectivelabs.org/privacy-policy" class="text-primary-500" target="_blank" />Privacy Policy</a> and acknowledge that you have read and understand the Injective Protocol <a href="https://injectiveprotocol.com/disclaimer" class="text-primary-500" target="_blank">disclaimer</a>.',
  'There are no results found - Markets':
    'There are no markets found. You can go ahead and propose some!',
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
  'Successfully Transferred': 'Successfully Transferred',
  'Enter amount': 'Enter amount',
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

  marketNew: {
    title: 'Upcoming market launch',
    depositNow: 'Deposit Now',
    connectAndDepositNow: 'Connect and Deposit now',
    soonToBeReleased: 'Coming soon!'
  },

  navigation: {
    balances: 'Balances',
    funding: 'Funding',
    disconnect: 'Disconnect',
    myAccount: 'My Account',
    connectedWallets: 'Connected Wallets',
    connected: 'Connected',
    referral: 'Referral',
    referralCode: 'Referral Code',
    rewards: 'Rewards',
    dashboard: 'Dashboard',
    trade: 'Trade',
    activities: 'Activities',
    activity: 'Activity',
    portfolio: 'Portfolio',
    home: 'Home',
    makerTakerFee: '-{maker}% maker / -{taker}% taker',
    noTierLevel: 'No VIP Tier',
    tradeAndEarn: 'Trade and Earn',
    tradeAndEarnDescription:
      'Each trade on Injective can earn you some rewards.',
    dmmProgram: 'Dmm program',
    dmmProgramDescription:
      'Flagship liquidity mining program designed for Dedicated Market Makers.'
  }
}

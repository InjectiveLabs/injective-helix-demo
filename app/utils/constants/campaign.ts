import { IS_DEVNET, IS_TESTNET, IS_MAINNET } from '@shared/utils/constant'

// Campaign
export const CAMPAIGN_ID = IS_TESTNET // no campaign for devnet
  ? 'spot-grid-tia-usdt'
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
  'https://helixapp.zendesk.com/hc/en-us/articles/8391676095887-Share-10-000-TIA-Rewards-in-Helix-Guilds-Competition'
export const GUILD_MIN_AMOUNT = 1000
export const GUILD_MAX_CAP = 150
export const GUILD_CAMPAIGN_END_DATE = 1702393200000

export const GUILD_VOLUME_REWARD_CONTRACT = IS_DEVNET
  ? 'inj182uvgv8vmzk8yusmtusnq55xs3x3dtp3zw0z2f'
  : 'inj17ryrqr78f9w0rmr2n77pvl9636ghurgkt2mmme'
export const GUILD_BALANCE_REWARD_CONTRACT = IS_DEVNET
  ? 'inj1f00gl2z68g5la6yfckpyfzk5gscaz6uw82qvx8'
  : 'inj1klxkep4s6fe2pltn6u2rctq8hl7fwzhmuwzvyt'

// Referral
export const REFERRAL_CONTRACT_ADDRESS = IS_MAINNET
  ? 'inj1t474vynqdjqzwzyq9clsenjqffatjqurfx95fs' // todo fred: update to mainnet SC address when available
  : 'inj1t474vynqdjqzwzyq9clsenjqffatjqurfx95fs'

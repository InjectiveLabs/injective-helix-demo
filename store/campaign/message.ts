import { msgBroadcaster } from '@shared/WalletService'
import { MsgExecuteContractCompat } from '@injectivelabs/sdk-ts'
import {
  GUILD_HASH_CHAR_LIMIT,
  GUILD_CONTRACT_ADDRESS
} from '@/app/utils/constants'
import { delayPromiseCall } from '@/app/utils/async'
import { generateUniqueHash } from '@/app/utils/formatters'
import { submitClaim } from '@/app/services/leaderboard'

export const claimReward = async (
  contractAddress: string,
  campaignId?: string
) => {
  const walletStore = useWalletStore()
  const sharedWalletStore = useSharedWalletStore()

  await walletStore.validate()

  if (!sharedWalletStore.isUserConnected) {
    return
  }

  const msg = campaignId ? { campaign_id: Number(campaignId) } : {}

  const message = MsgExecuteContractCompat.fromJSON({
    sender: sharedWalletStore.injectiveAddress,
    contractAddress,
    exec: {
      action: 'claim_reward',
      msg
    }
  })

  const tx = await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: [message],
    injectiveAddress: sharedWalletStore.injectiveAddress
  })

  return tx
}

export const createGuild = async ({
  name,
  logo,
  description
}: {
  name: string
  logo: string
  description: string
}) => {
  const walletStore = useWalletStore()
  const campaignStore = useCampaignStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected) {
    return
  }

  await walletStore.validate()

  const messages = MsgExecuteContractCompat.fromJSON({
    sender: sharedWalletStore.injectiveAddress,
    contractAddress: GUILD_CONTRACT_ADDRESS,
    exec: {
      action: 'create_guild',
      msg: {
        name,
        logo,
        description,
        id: generateUniqueHash({
          value: `${Date.now()}`,
          limit: GUILD_HASH_CHAR_LIMIT
        })
      }
    }
  })

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })

  await delayPromiseCall(
    () =>
      Promise.all([
        campaignStore.fetchGuildsByTVL(),
        campaignStore.fetchGuildsByVolume()
      ]),
    3 * 1000
  )
}

export const joinGuild = async ({
  limit,
  guildId
}: {
  limit: number
  guildId: string
}) => {
  const walletStore = useWalletStore()
  const campaignStore = useCampaignStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected) {
    return
  }

  await walletStore.validate()

  const messages = MsgExecuteContractCompat.fromJSON({
    sender: sharedWalletStore.injectiveAddress,
    contractAddress: GUILD_CONTRACT_ADDRESS,
    exec: {
      action: 'join_guild',
      msg: {
        id: guildId
      }
    }
  })

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })

  await delayPromiseCall(
    () => campaignStore.fetchGuildDetails({ guildId, skip: 0, limit }),
    3 * 1000
  )
}

export const submitLeaderboardCompetitionClaim = async ({
  name,
  email,
  wallet,
  pubKey,
  message,
  signature,
  competitionName,
  injectiveAddress
}: {
  name: string
  email: string
  wallet: string
  message: string
  pubKey?: string
  signature: string
  competitionName: string
  injectiveAddress: string
}) => {
  const campaignStore = useCampaignStore()

  await submitClaim({
    name,
    email,
    wallet,
    pubKey,
    message,
    signature,
    competitionName,
    injectiveAddress
  })

  await delayPromiseCall(
    () =>
      campaignStore.fetchLeaderboardCompetitionResults(
        competitionName,
        injectiveAddress
      ),
    2 * 1000
  )
}

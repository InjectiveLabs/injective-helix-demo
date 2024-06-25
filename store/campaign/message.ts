import { msgBroadcaster } from '@shared/WalletService'
import { MsgExecuteContractCompat } from '@injectivelabs/sdk-ts'
import {
  GUILD_HASH_CHAR_LIMIT,
  GUILD_CONTRACT_ADDRESS
} from '@/app/utils/constants'
import { delayPromiseCall } from '@/app/utils/async'
import { generateUniqueHash } from '@/app/utils/formatters'

export const claimReward = async (
  contractAddress: string,
  campaignId?: string
) => {
  const walletStore = useSharedWalletStore()

  await walletStore.validate()

  if (!walletStore.address) {
    return
  }

  const msg = campaignId ? { campaign_id: Number(campaignId) } : {}

  const message = MsgExecuteContractCompat.fromJSON({
    sender: walletStore.injectiveAddress,
    contractAddress,
    exec: {
      action: 'claim_reward',
      msg
    }
  })

  const tx = await msgBroadcaster.broadcastWithFeeDelegation({
    msgs: [message],
    injectiveAddress: walletStore.injectiveAddress
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
  const walletStore = useSharedWalletStore()
  const campaignStore = useCampaignStore()

  await walletStore.validate()

  const messages = MsgExecuteContractCompat.fromJSON({
    sender: walletStore.injectiveAddress,
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

  await walletStore.broadcastWithFeeDelegation({ messages })

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
  const walletStore = useSharedWalletStore()
  const campaignStore = useCampaignStore()

  await walletStore.validate()

  const messages = MsgExecuteContractCompat.fromJSON({
    sender: walletStore.injectiveAddress,
    contractAddress: GUILD_CONTRACT_ADDRESS,
    exec: {
      action: 'join_guild',
      msg: {
        id: guildId
      }
    }
  })

  await walletStore.broadcastWithFeeDelegation({ messages })

  await delayPromiseCall(
    () => campaignStore.fetchGuildDetails({ guildId, skip: 0, limit }),
    3 * 1000
  )
}

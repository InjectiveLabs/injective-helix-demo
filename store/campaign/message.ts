import { MsgExecuteContractCompat } from '@injectivelabs/sdk-ts'
import { msgBroadcastClient } from '@/app/Services'
import { delayPromiseCall } from '@/app/utils/async'
import {
  GUILD_HASH_CHAR_LIMIT,
  GUILD_CONTRACT_ADDRESS
} from '@/app/utils/constants'
import { generateUniqueHash } from '@/app/utils/formatters'

export const createGuild = async ({
  name,
  logo,
  description
}: {
  name: string
  logo: string
  description: string
}) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const campaignStore = useCampaignStore()

  await appStore.queue()
  await walletStore.validate()

  const message = MsgExecuteContractCompat.fromJSON({
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

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: message,
    injectiveAddress: walletStore.injectiveAddress
  })

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
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const campaignStore = useCampaignStore()

  await appStore.queue()
  await walletStore.validate()

  const message = MsgExecuteContractCompat.fromJSON({
    sender: walletStore.injectiveAddress,
    contractAddress: GUILD_CONTRACT_ADDRESS,
    exec: {
      action: 'join_guild',
      msg: {
        id: guildId
      }
    }
  })

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: message,
    injectiveAddress: walletStore.injectiveAddress
  })

  await delayPromiseCall(
    () => campaignStore.fetchGuildDetails({ guildId, skip: 0, limit }),
    3 * 1000
  )
}

import { MsgExecuteContractCompat } from '@injectivelabs/sdk-ts'
import { msgBroadcastClient } from '@/app/Services'
import { GUILD_CONTRACT_ADDRESS } from '@/app/utils/constants'

export const createGuild = async ({ name }: { name: string }) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()

  await appStore.queue()
  await walletStore.validate()

  const message = MsgExecuteContractCompat.fromJSON({
    sender: walletStore.injectiveAddress,
    contractAddress: GUILD_CONTRACT_ADDRESS,
    exec: {
      action: 'create_guild',
      msg: {
        name,
        description: ''
      }
    }
  })

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: message,
    injectiveAddress: walletStore.injectiveAddress
  })
}

export const joinGuild = async ({ guildId }: { guildId: string }) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()

  await appStore.queue()
  await walletStore.validate()

  const message = MsgExecuteContractCompat.fromJSON({
    sender: walletStore.injectiveAddress,
    contractAddress: GUILD_CONTRACT_ADDRESS,
    exec: {
      action: 'join_guild',
      msg: {
        guild_id: Number(guildId)
      }
    }
  })

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: message,
    injectiveAddress: walletStore.injectiveAddress
  })
}

import { faucetService } from '@shared/Service'
import { MsgExecuteContractCompat } from '@injectivelabs/sdk-ts'
import { REFERRAL_CONTRACT_ADDRESS } from '@/app/data/referral'

export const registerInvitee = async (referralCode: string) => {
  const walletStore = useWalletStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected) {
    return
  }

  await walletStore.validate()

  // This function will fund the referee with dust amount if the referee's address is not created on chain
  try {
    await faucetService.fundInjectiveAddress(sharedWalletStore.injectiveAddress)
  } catch {
    // silently throw error
  }

  const messages = MsgExecuteContractCompat.fromJSON({
    sender: sharedWalletStore.injectiveAddress,
    contractAddress: REFERRAL_CONTRACT_ADDRESS,
    exec: {
      action: 'registerinvitee',
      msg: { code: referralCode, referree: sharedWalletStore.injectiveAddress }
    }
  })

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })
}

export const createReferralLink = async (referralCode: string) => {
  const walletStore = useWalletStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected) {
    return
  }

  await walletStore.validate()

  try {
    await faucetService.fundInjectiveAddress(sharedWalletStore.injectiveAddress)
  } catch {
    // silently throw error
  }

  const messages = MsgExecuteContractCompat.fromJSON({
    sender: sharedWalletStore.injectiveAddress,
    contractAddress: REFERRAL_CONTRACT_ADDRESS,
    exec: {
      action: 'register_referrer',
      msg: { code: referralCode }
    }
  })

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })
}

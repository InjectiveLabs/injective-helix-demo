import { usdtToken } from '@shared/data/token'
import { BigNumberInBase } from '@injectivelabs/utils'
import { sharedBackupPromiseCall } from '@shared/utils/async'
import { NEPTUNE_USDT_CW20_CONTRACT } from '@injectivelabs/sdk-ts'
import { neptuneService } from '@/app/Services'

export const fetchNeptuneRedemptionRatio = async () => {
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected) {
    return
  }

  const cw20Asset = {
    token: {
      contract_addr: NEPTUNE_USDT_CW20_CONTRACT
    }
  }

  const nativeAsset = {
    native_token: {
      denom: usdtToken?.denom || ''
    }
  }

  accountStore.$patch({
    neptuneUsdtRedemptionRatio: await neptuneService.fetchRedemptionRatio({
      cw20Asset,
      nativeAsset
    })
  })
}

export const convertNeptuneToPeggyUsdt = async (
  amountNeptuneUsdtCw20: string
) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected) {
    return
  }

  await walletStore.validate()

  const withdrawMsg = neptuneService.createWithdrawMsg({
    sender: sharedWalletStore.injectiveAddress,
    amount: new BigNumberInBase(amountNeptuneUsdtCw20)
      .integerValue(BigNumberInBase.ROUND_DOWN)
      .toFixed()
  })

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [withdrawMsg]
  })

  sharedBackupPromiseCall(() =>
    Promise.all([
      accountStore.fetchCw20Balances(),
      accountStore.fetchAccountPortfolioBalances()
    ])
  )
}

export const convertPeggyToNeptuneUsdt = async (amountInPeggyUsdt: string) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected) {
    return
  }

  await walletStore.validateGeo()
  await walletStore.validate()

  const depositMsg = neptuneService.createDepositMsg({
    denom: usdtToken.denom,
    sender: sharedWalletStore.injectiveAddress,
    amount: new BigNumberInBase(amountInPeggyUsdt)
      .toWei(usdtToken.decimals)
      .integerValue(BigNumberInBase.ROUND_DOWN)
      .toFixed()
  })

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [depositMsg]
  })

  sharedBackupPromiseCall(() =>
    Promise.all([
      accountStore.fetchCw20Balances(),
      accountStore.fetchAccountPortfolioBalances()
    ])
  )
}

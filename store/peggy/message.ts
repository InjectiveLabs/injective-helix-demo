import {
  ZERO_IN_WEI,
  UNLIMITED_ALLOWANCE,
  BalanceWithTokenWithErc20Balance,
  BalanceWithTokenWithErc20BalanceWithPrice
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  getEthereumAddress,
  MsgSendToEth,
  msgsOrMsgExecMsgs
} from '@injectivelabs/sdk-ts'
import type { Erc20Token, Token } from '@injectivelabs/token-metadata'
import {
  msgBroadcastClient,
  web3Broadcaster,
  web3Composer
} from '@/app/Services'
import { AppState } from '@/types'
import { allowanceResetSymbols } from '@/app/data/token'

export const transfer = async ({
  token,
  amount,
  balanceWithTokenAndPrice
}: {
  token: Token
  amount: BigNumberInBase
  balanceWithTokenAndPrice: BalanceWithTokenWithErc20BalanceWithPrice
}) => {
  const peggyStore = usePeggyStore()
  const walletStore = useWalletStore()
  const appStore = useAppStore()

  if (!walletStore.isUserWalletConnected) {
    return
  }

  await appStore.queue()
  await appStore.fetchGasPrice()
  await walletStore.validate()

  const ethDestinationAddress = getEthereumAddress(walletStore.injectiveAddress)
  const actualAmount = new BigNumberInBase(
    amount.toFixed(3, BigNumberInBase.ROUND_DOWN)
  )
    .toWei(token.decimals)
    .toFixed()

  const allowance = new BigNumberInWei(
    balanceWithTokenAndPrice.erc20Balance.allowance
  )
  const allowanceSet = new BigNumberInWei(actualAmount).lte(allowance)

  if (!allowanceSet) {
    await peggyStore.resetOrSetAllowance(balanceWithTokenAndPrice, allowance)
  }

  const tx = await web3Composer.getPeggyTransferTx({
    address: walletStore.address,
    gasPrice: appStore.gasPrice,
    denom: token.denom,
    amount: actualAmount,
    destinationAddress: ethDestinationAddress
  })

  await web3Broadcaster.sendTransaction({
    tx,
    address: walletStore.address
  })
}

export const withdraw = async ({
  amount,
  bridgeFee,
  token
}: {
  amount: BigNumberInBase
  bridgeFee: BigNumberInBase
  token: Token
}) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()

  if (!walletStore.isUserWalletConnected) {
    return
  }

  await appStore.queue()
  await walletStore.validate()

  /**
   * If the bridge fee is 0 we set it to the lowest number for that denom
   * this usually happens when we can't fetch the usd price of the token
   */
  const actualBridgeFee = new BigNumberInWei(
    bridgeFee.isZero()
      ? new BigNumberInWei(1)
      : bridgeFee.toWei(token.decimals).toFixed(0)
  )

  const amountToFixed = amount.toWei(token.decimals).toFixed(0)
  const actualAmount = new BigNumberInBase(amountToFixed)
    .minus(actualBridgeFee)
    .toFixed(0)

  const message = MsgSendToEth.fromJSON({
    address: walletStore.authZOrAddress,
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    amount: {
      denom: token.denom,
      amount: actualAmount
    },
    bridgeFee: {
      denom: token.denom,
      amount: actualBridgeFee.toFixed()
    }
  })

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
  })
}

export const resetOrSetAllowance = async (
  balanceWithToken: BalanceWithTokenWithErc20Balance,
  allowance: BigNumberInWei
) => {
  const appStore = useAppStore()
  const peggyStore = usePeggyStore()

  appStore.$patch({
    state: AppState.Idle
  })

  /**
   * If the allowance is not 0 we first need to reset it to 0
   * and then set it again to the unlimited allowance
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   */
  if (
    allowance.gte(0) &&
    allowanceResetSymbols.includes(balanceWithToken.token.symbol)
  ) {
    await peggyStore.setTokenAllowance(balanceWithToken, ZERO_IN_WEI)
  }

  appStore.$patch({
    state: AppState.Idle
  })

  await peggyStore.setTokenAllowance(balanceWithToken)
}

export const setTokenAllowance = async (
  balanceWithToken: BalanceWithTokenWithErc20Balance,
  amount = UNLIMITED_ALLOWANCE
) => {
  const peggyStore = usePeggyStore()
  const walletStore = useWalletStore()
  const appStore = useAppStore()

  const tokenAddress = balanceWithToken.token.erc20?.address

  if (!tokenAddress) {
    return
  }

  await appStore.queue()
  await appStore.fetchGasPrice()
  await walletStore.validate()

  const tx = await web3Composer.getSetTokenAllowanceTx({
    tokenAddress,
    address: walletStore.address,
    gasPrice: appStore.gasPrice,
    amount: amount.toFixed()
  })

  await web3Broadcaster.sendTransaction({
    tx,
    address: walletStore.address
  })

  const token = peggyStore.tradeableErc20BalancesWithTokenAndPrice.find(
    (balance) => {
      const erc20Token = balance.token as Erc20Token

      return (
        erc20Token.erc20.address.toLowerCase() === tokenAddress.toLowerCase()
      )
    }
  )

  if (!token) {
    return
  }

  await peggyStore.getErc20TokenBalanceAndAllowance(balanceWithToken.token)
}

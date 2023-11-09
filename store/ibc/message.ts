import { BigNumberInBase } from '@injectivelabs/utils'
import { Token } from '@injectivelabs/token-metadata'
import { GeneralException } from '@injectivelabs/exceptions'
import { CosmosChainId } from '@injectivelabs/ts-types'
import { MsgTransfer, makeTimeoutTimestampInNs } from '@injectivelabs/sdk-ts'
import { CosmosChannel } from '@injectivelabs/sdk-ui-ts'
import {
  transferToInjective,
  fetchLatestBlockFromChainId
} from '@/app/services/cosmos'
import { CHAIN_ID } from '@/app/utils/constants'
import { msgBroadcastClient } from '@/app/Services'
import { backupPromiseCall } from '@/app/utils/async'

export const deposit = async ({
  token,
  amount,
  destinationAddress
}: {
  amount: BigNumberInBase
  destinationAddress: string
  token: Token
}) => {
  const accountStore = useAccountStore()
  const ibcStore = useIbcStore()
  const walletStore = useWalletStore()

  if (
    !ibcStore.cosmosAddress ||
    !ibcStore.channel ||
    !walletStore.isCosmosWallet
  ) {
    return
  }

  await ibcStore.validate()

  const balanceWithToken = ibcStore.balancesWithToken.find(
    (balanceWithToken) => balanceWithToken.denom === token.denom
  )

  if (!balanceWithToken || !balanceWithToken.token.ibc) {
    throw new GeneralException(
      new Error(
        `Ibc config for ${token.symbol} - ${ibcStore.channel.aToBChannelId} not found`
      )
    )
  }

  await transferToInjective({
    destinationAddress,

    wallet: walletStore.wallet,
    port: ibcStore.channel.port,
    aChainId: ibcStore.channel.aChainId,
    bChainId: ibcStore.channel.bChainId,
    channelId: ibcStore.channel.aToBChannelId,
    originAddress: ibcStore.cosmosAddress,
    token: balanceWithToken.token,
    amount: new BigNumberInBase(
      amount.toFixed(3, BigNumberInBase.ROUND_DOWN)
    ).toWei(balanceWithToken.token.decimals)
  })

  backupPromiseCall(() => accountStore.fetchAccountPortfolio())
  backupPromiseCall(() => ibcStore.fetchBalances())
}

export const withdraw = async ({
  token,
  amount,
  channel,
  destinationAddress
}: {
  channel?: CosmosChannel
  amount: BigNumberInBase
  destinationAddress: string
  token: Token
}) => {
  const accountStore = useAccountStore()
  const walletStore = useWalletStore()
  const ibcStore = useIbcStore()

  const actualChannel = channel || ibcStore.channel
  const { injectiveAddress, isUserWalletConnected } = walletStore

  if (!isUserWalletConnected || !actualChannel) {
    return
  }

  const balanceWithToken = ibcStore.ibcTokens.find(
    (balanceWithToken) => balanceWithToken.denom === token.denom
  )

  await walletStore.validate()

  if (!balanceWithToken || !balanceWithToken.ibc) {
    throw new GeneralException(
      new Error(
        `Base denom for  ${token.symbol}/${actualChannel.bToAChannelId} not found`
      )
    )
  }

  const actualAmount = new BigNumberInBase(
    amount.toFixed(3, BigNumberInBase.ROUND_DOWN)
  ).toWei(token.decimals)
  const actualAmountToString = actualAmount.toFixed(
    0,
    BigNumberInBase.ROUND_DOWN
  )

  /** Block Details */
  const timeoutTimestamp = makeTimeoutTimestampInNs()
  const destinationLatestBlock = await fetchLatestBlockFromChainId(
    actualChannel.aChainId as CosmosChainId
  )

  const message = MsgTransfer.fromJSON({
    port: actualChannel.port,
    memo: `IBC transfer from ${CHAIN_ID} to ${actualChannel.aChainId}`,
    sender: injectiveAddress,
    receiver: destinationAddress,
    channelId: actualChannel.bToAChannelId,
    timeout: timeoutTimestamp,
    height: {
      revisionHeight: new BigNumberInBase(destinationLatestBlock.header.height)
        .plus(100)
        .toNumber(),
      revisionNumber: new BigNumberInBase(
        destinationLatestBlock.header.version.block
      ).toNumber()
    },
    amount: {
      denom: balanceWithToken.denom,
      amount: actualAmountToString
    }
  })

  await msgBroadcastClient.broadcastWithFeeDelegation({
    injectiveAddress,
    msgs: message
  })

  backupPromiseCall(() => accountStore.fetchAccountPortfolio())
  backupPromiseCall(() => ibcStore.fetchBalances())
}

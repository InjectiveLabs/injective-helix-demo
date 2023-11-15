import {
  Wallet,
  UtilsWallets,
  WalletDeviceType,
  CosmosWalletStrategy,
  getEndpointsFromChainId
} from '@injectivelabs/wallet-ts'
import { Token, IbcToken, TokenType } from '@injectivelabs/token-metadata'
import {
  awaitForAll,
  BigNumberInWei,
  BigNumberInBase,
  getStdFeeForToken,
  DEFAULT_IBC_GAS_LIMIT
} from '@injectivelabs/utils'
import { CosmosChainId } from '@injectivelabs/ts-types'
import {
  ErrorType,
  GeneralException,
  HttpRequestException,
  UnspecifiedErrorCode,
  CosmosWalletException
} from '@injectivelabs/exceptions'
import {
  CosmosChannel,
  getGasPriceForChainId,
  cosmosChainTokenMetaMap,
  BalanceWithTokenWithIbcBalance
} from '@injectivelabs/sdk-ui-ts'
import {
  PublicKey,
  BaseAccount,
  MsgTransfer,
  TxRestClient,
  ChainRestBankApi,
  ChainRestAuthApi,
  MsgTransferCosmjs,
  ChainRestTendermintApi,
  makeTimeoutTimestampInNs,
  createTransactionAndCosmosSignDocForAddressAndMsg
} from '@injectivelabs/sdk-ts'
import { channelIbcDenomToBaseDenomMap } from '@injectivelabs/token-metadata/dist/esm/ibc/channels'
import { CHAIN_ID, ENDPOINTS } from '@/app/utils/constants'
import { walletStrategy } from '@/app/wallet-strategy'

export const confirmCorrectKeplrAddress = async (injectiveAddress: string) => {
  // We only perform this check for Keplr addresses
  if (walletStrategy.getWallet() !== Wallet.Keplr) {
    return
  }

  const keplr = new UtilsWallets.KeplrWallet(CHAIN_ID)
  const key = await keplr.getKey()
  const publicKey = PublicKey.fromBase64(
    Buffer.from(key.pubKey).toString('base64')
  )

  const { address: derivedAddress } = publicKey.toAddress()

  if (derivedAddress !== injectiveAddress) {
    throw new CosmosWalletException(
      new Error(
        'Connected Keplr address is wrong. Please update Injective on Keplr.'
      )
    )
  }
}

export const validateCosmosWallet = async ({
  wallet,
  address,
  chainId
}: {
  wallet: Wallet
  address: string
  chainId: CosmosChainId
}) => {
  const cosmosWalletStrategy = new CosmosWalletStrategy({
    wallet,
    chainId
  })

  const accounts = await cosmosWalletStrategy.enableAndGetAddresses()

  if (accounts.length === 0) {
    throw new CosmosWalletException(
      new Error('Your Keplr wallet is not installed or its not unlocked'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletNotInstalledError
      }
    )
  }

  const [account] = accounts
  const activeAddressDoesntMatchTheActiveAddress =
    address && account.toLowerCase() !== address.toLowerCase()

  if (activeAddressDoesntMatchTheActiveAddress) {
    throw new CosmosWalletException(
      new Error(
        `You are connected to the wrong address. Your connected address is ${address}`
      ),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }
}

export const getAccountsFromCosmosWallet = async (
  chainId: CosmosChainId,
  wallet: Wallet
) => {
  const cosmosWalletStrategy = new CosmosWalletStrategy({
    wallet,
    chainId
  })

  return await cosmosWalletStrategy.enableAndGetAddresses()
}

export const getTokenMetaFromChainId = (chainId: string): Token | Token[] => {
  const tokenMeta = cosmosChainTokenMetaMap[chainId]

  if (!tokenMeta) {
    throw new GeneralException(
      new Error(`Token native denom for ${chainId} not found`)
    )
  }

  if (!Array.isArray(tokenMeta) && !tokenMeta.ibc) {
    throw new GeneralException(
      new Error(`Token native denom for ${chainId} not found`)
    )
  }

  if (Array.isArray(tokenMeta)) {
    return tokenMeta.map((token) => ({
      ...token,
      tokenType: TokenType.Ibc
    }))
  }

  return { ...tokenMeta, tokenType: TokenType.Ibc }
}

export const getCosmosChainBalanceNoThrow = async ({
  chainId,
  address,
  baseDenom
}: {
  chainId: CosmosChainId
  address: string
  baseDenom: string
}) => {
  const endpoints = getEndpointsFromChainId(chainId)
  const chainRestBankApi = new ChainRestBankApi(endpoints.rest)

  try {
    const balance = await chainRestBankApi.fetchBalance(address, baseDenom)

    return balance.amount
  } catch (e) {
    return '0'
  }
}

export const fetchTokensFromChainId = (channel: CosmosChannel) => {
  const cosmosChainId = channel.aChainId as CosmosChainId
  const tokenMeta = getTokenMetaFromChainId(cosmosChainId)
  const tokensMeta = Array.isArray(tokenMeta) ? tokenMeta : [tokenMeta]

  return tokensMeta
    .map((tokenMeta) => {
      if (tokenMeta.ibc) {
        return tokenMeta
      }

      const denomsMapForChannelId =
        channelIbcDenomToBaseDenomMap[
          channel.bToAChannelId as keyof typeof channelIbcDenomToBaseDenomMap
        ]

      // TODO: handle dot-plank
      if (!denomsMapForChannelId) {
        return undefined
      }

      if (!Object.keys(denomsMapForChannelId).includes(tokenMeta.denom)) {
        return undefined
      }

      const baseDenom =
        denomsMapForChannelId[
          tokenMeta.denom as keyof typeof denomsMapForChannelId
        ]

      if (!baseDenom) {
        return undefined
      }

      return {
        ...tokenMeta,
        ibc: {
          baseDenom
        }
      } as Token
    })
    .filter((tokenMeta) => tokenMeta) as Token[]
}

export const fetchBalancesWithTokenFromChainId = async (
  address: string,
  channel: CosmosChannel
): Promise<BalanceWithTokenWithIbcBalance[]> => {
  const cosmosChainId = channel.aChainId as CosmosChainId
  const tokens = await fetchTokensFromChainId(channel)

  const balances = await awaitForAll(tokens, async (token) => {
    const balance = await getCosmosChainBalanceNoThrow({
      address,
      chainId: cosmosChainId,
      baseDenom: token.ibc!.baseDenom
    })

    return {
      token,
      denom: token.denom,
      balance: '0',
      ibcBalance: {
        balance
      }
    }
  })

  return balances
}

export const fetchLatestBlockFromChainId = async (chainId: CosmosChainId) => {
  const endpoints = getEndpointsFromChainId(chainId)
  const chainRestTendermintApi = new ChainRestTendermintApi(endpoints.rest)

  try {
    return await chainRestTendermintApi.fetchLatestBlock()
  } catch (error) {
    throw new HttpRequestException(
      new Error(`Failed to fetch latest block for ${chainId}`)
    )
  }
}

export const transferToInjective = async ({
  amount,
  token,
  port,
  aChainId,
  channelId,
  originAddress,
  destinationAddress,
  wallet = Wallet.Keplr
}: {
  wallet: Wallet
  port: string
  channelId: string
  aChainId: string
  bChainId: string
  amount: BigNumberInWei
  token: Token
  originAddress: string
  destinationAddress: string
}) => {
  const cosmosChainId = aChainId as CosmosChainId
  const cosmosWalletStrategy = new CosmosWalletStrategy({
    wallet,
    chainId: cosmosChainId
  })

  const endpoints = getEndpointsFromChainId(cosmosChainId)
  const txRestClient = new TxRestClient(endpoints.rest)
  const tendermintRestApi = new ChainRestTendermintApi(ENDPOINTS.rest)

  /** Account Details **/
  const chainRestAuthApi = new ChainRestAuthApi(endpoints.rest)
  const accountDetailsResponse = await chainRestAuthApi.fetchCosmosAccount(
    originAddress
  )

  const baseAccount = BaseAccount.fromRestCosmosApi(accountDetailsResponse)
  const accountDetails = baseAccount.toAccountDetails()
  const pubKey = await cosmosWalletStrategy.getPubKey()

  /** Block Details */
  const destinationLatestBlock = await tendermintRestApi.fetchLatestBlock()

  /** Prepare the Transaction * */
  const gasPrice = getGasPriceForChainId(cosmosChainId).toString()
  const stdFee = {
    ...getStdFeeForToken(token, gasPrice),
    gas: DEFAULT_IBC_GAS_LIMIT.toString()
  }
  const timestamp = makeTimeoutTimestampInNs()

  const msgTransferParams = {
    port,
    channelId,
    memo: `IBC transfer from ${channelId} to ${CHAIN_ID}`,
    timeout: timestamp,
    sender: originAddress,
    receiver: destinationAddress,
    height: {
      revisionHeight: new BigNumberInBase(destinationLatestBlock.header.height)
        .plus(100)
        .toNumber(),
      revisionNumber: new BigNumberInBase(
        destinationLatestBlock.header.version.block
      ).toNumber()
    },
    amount: {
      denom: (token as IbcToken).ibc.baseDenom,
      amount: amount.toFixed(0, BigNumberInBase.ROUND_DOWN)
    }
  }

  /**
   * When using Ledger with Keplr on other Cosmos Chain we have
   * to send amino sign doc to sign and broadcast on keplr
   */
  if (cosmosWalletStrategy.getWallet() === Wallet.Keplr) {
    const walletDeviceType = await cosmosWalletStrategy.getWalletDeviceType()
    const isLedgerConnectedOnKeplr =
      walletDeviceType === WalletDeviceType.Hardware

    if (isLedgerConnectedOnKeplr) {
      const keplrWallet = new UtilsWallets.KeplrWallet(cosmosChainId)
      const msgTransferAmino = MsgTransferCosmjs.fromJSON(msgTransferParams)

      await keplrWallet.signAndBroadcastAminoUsingCosmjs(
        [msgTransferAmino.toAmino()],
        stdFee
      )
    }
  }

  const message = MsgTransfer.fromJSON(msgTransferParams)

  /** Prepare the Transaction * */
  const { txRaw } = await createTransactionAndCosmosSignDocForAddressAndMsg({
    pubKey,
    message,
    chainId: aChainId,
    address: originAddress,
    endpoint: endpoints.rest,
    fee: stdFee
  })

  /* Sign the transaction */
  const directSignResponse = await cosmosWalletStrategy.signTransaction({
    txRaw,
    chainId: aChainId,
    address: originAddress,
    accountNumber: accountDetails.accountNumber
  })

  const txResponse = await cosmosWalletStrategy.sendTransaction(
    directSignResponse
  )
  const response = await txRestClient.fetchTxPoll(txResponse.txHash)

  return {
    ...response,
    transactionHash: response.txHash
  }
}

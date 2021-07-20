import { AccountAddress, ChainId } from '@injectivelabs/ts-types'
import { Web3Exception } from '@injectivelabs/exceptions'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { BaseCurrencyContract } from '@injectivelabs/contracts/dist/contracts/BaseCurrency'
import { contractAddresses } from '@injectivelabs/contracts'
import { PeggyComposer } from '@injectivelabs/chain-consumer'
import { Erc20TokenMeta, TokenMeta } from '@injectivelabs/token-metadata'
import { TxProvider } from '~/app/providers/TxProvider'
import { peggyDenomToContractAddress } from '~/app/transformers/peggy'
import { coinGeckoConsumer } from '~/app/singletons/CoinGeckoConsumer'
import { getContracts } from '~/app/singletons/Contracts'
import {
  CHAIN_ID,
  INJECTIVE_DENOM,
  MAXIMUM_TRANSFER_ALLOWED,
  TRANSFER_RESTRICTIONS_ENABLED,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import { getTransactionOptions } from '~/app/utils/transaction'
import { getWeb3Strategy, transactionReceiptAsync } from '~/app/web3'
import { Token, TokenWithBalance } from '~/types'
import { AccountMetrics } from '~/types/metrics'

export const getTokenBalanceAndAllowance = async ({
  address,
  token
}: {
  address: AccountAddress
  token: Token
}): Promise<TokenWithBalance> => {
  const web3Strategy = getWeb3Strategy()
  const contracts = getContracts()

  try {
    const erc20Contract = new BaseCurrencyContract({
      web3Strategy,
      address: token.address,
      chainId: CHAIN_ID
    })

    const balance = await erc20Contract.getBalanceOf(address).callAsync()
    const allowance = await erc20Contract
      .getAllowanceOf(address, contracts.peggy.address)
      .callAsync()

    return {
      ...token,
      balance: new BigNumberInWei(balance || 0),
      allowance: new BigNumberInWei(allowance || 0)
    }
  } catch (e) {
    return {
      ...token,
      balance: new BigNumberInWei(0),
      allowance: new BigNumberInWei(0)
    }
  }
}

export const setTokenAllowance = async ({
  address,
  amount,
  gasPrice,
  tokenAddress
}: {
  address: AccountAddress
  amount: BigNumberInWei
  gasPrice: BigNumberInWei
  tokenAddress: string
}) => {
  const contracts = getContracts()
  const web3Strategy = getWeb3Strategy()
  const erc20Contract = new BaseCurrencyContract({
    web3Strategy,
    address: tokenAddress,
    chainId: CHAIN_ID
  })
  const setAllowanceOfContractFunction = erc20Contract.setAllowanceOf({
    amount,
    contractAddress: contracts.peggy.address,
    transactionOptions: getTransactionOptions({
      gasPrice: ZERO_IN_BASE.toFixed(),
      from: address
    })
  })

  const data = setAllowanceOfContractFunction.getABIEncodedTransactionData()
  const gas = new BigNumberInWei(
    await setAllowanceOfContractFunction.estimateGasAsync()
  )

  try {
    const txHash = await web3Strategy.sendTransaction(
      {
        from: address,
        to: tokenAddress,
        gas: gas.toNumber().toString(16),
        gasPrice: gasPrice.toNumber().toString(16),
        data
      },
      { address, chainId: CHAIN_ID }
    )

    await transactionReceiptAsync(txHash)
  } catch (error) {
    throw new Web3Exception(error.message)
  }
}

export const transfer = async ({
  amount,
  address,
  denom,
  gasPrice
}: {
  amount: BigNumberInWei
  gasPrice: BigNumberInWei
  denom: string
  address: AccountAddress
}) => {
  const contracts = getContracts()
  const web3Strategy = getWeb3Strategy()
  const contractAddress = peggyDenomToContractAddress(denom)
  const depositForContractFunction = contracts.peggy.sendToCosmos({
    amount,
    contractAddress,
    address: `0x${'0'.repeat(24)}${address.slice(2)}`,
    transactionOptions: getTransactionOptions({
      gasPrice: ZERO_IN_BASE.toFixed(),
      from: address
    })
  })

  const data = depositForContractFunction.getABIEncodedTransactionData()
  const gas = new BigNumberInWei(
    await depositForContractFunction.estimateGasAsync()
  )

  try {
    const txHash = await web3Strategy.sendTransaction(
      {
        from: address,
        to: contracts.peggy.address,
        gas: gas.toNumber().toString(16),
        gasPrice: gasPrice.toNumber().toString(16),
        data
      },
      { address, chainId: CHAIN_ID }
    )
    await transactionReceiptAsync(txHash)
  } catch (error) {
    throw new Web3Exception(error.message)
  }
}

export const withdraw = async ({
  address,
  denom,
  amount,
  bridgeFee,
  injectiveAddress,
  destinationAddress
}: {
  amount: BigNumberInWei
  address: AccountAddress
  denom: string
  bridgeFee: BigNumberInWei
  destinationAddress: string
  injectiveAddress: AccountAddress
}) => {
  const message = PeggyComposer.withdraw({
    denom,
    amount: amount.minus(bridgeFee),
    bridgeFeeAmount: bridgeFee.toFixed(),
    bridgeFeeDenom: denom,
    address: destinationAddress,
    cosmosAddress: injectiveAddress
  })

  try {
    const txProvider = new TxProvider({
      address,
      message,
      bucket: AccountMetrics.SendToEth,
      chainId: CHAIN_ID
    })

    await txProvider.broadcast()
  } catch (error) {
    throw new Web3Exception(error.message)
  }
}

export const validateTransferRestrictions = async (
  amount: BigNumberInBase,
  token: TokenWithBalance
) => {
  if (!TRANSFER_RESTRICTIONS_ENABLED) {
    return
  }

  if (token.denom === INJECTIVE_DENOM) {
    return
  }

  const { data: coins } = await coinGeckoConsumer.fetchCoins()
  const coin = coins.find(
    (coin) => coin.symbol.toLowerCase() === token.symbol.toLowerCase()
  )

  if (!coin) {
    throw new Error(`Asset's data couldn't be fetched.`)
  }

  if (!coin.id) {
    throw new Error(`Asset's data couldn't be fetched.`)
  }

  const {
    data: { market_data: marketData }
  } = await coinGeckoConsumer.fetchCoin(coin.id)

  if (!marketData) {
    throw new Error(`Asset's market data couldn't be fetched.`)
  }

  const { current_price: currentPrice } = marketData

  if (!currentPrice) {
    throw new Error(`Asset's prices couldn't be fetched.`)
  }

  if (!currentPrice.usd) {
    throw new Error(`Asset's USD price couldn't be fetched.`)
  }

  const usdPrice = currentPrice.usd

  if (amount.times(usdPrice).gt(MAXIMUM_TRANSFER_ALLOWED)) {
    throw new Error(
      `You cannot transfer more than $${MAXIMUM_TRANSFER_ALLOWED.toFixed()} worth of assets to our Canary Chain.`
    )
  }
}

export const getTokenMetaData = (denom: string): TokenMeta | undefined => {
  const address = denom.startsWith('peggy') ? denom.replace('peggy', '') : denom
  const erc20Address =
    address.toLowerCase() === 'inj'
      ? contractAddresses[CHAIN_ID].injective
      : address

  const meta =
    CHAIN_ID === ChainId.Mainnet
      ? Erc20TokenMeta.getMetaByAddress(erc20Address)
      : Erc20TokenMeta.getMetaByKovanAddress(erc20Address)

  if (!meta) {
    return
  }

  return meta
}

export const getTokenMetaDataBySymbol = (
  symbol: string
): TokenMeta | undefined => {
  return Erc20TokenMeta.getMetaBySymbol(symbol)
}

import { AccountAddress } from '@injectivelabs/ts-types'
import { Web3Exception } from '@injectivelabs/exceptions'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { BaseCurrencyContract } from '@injectivelabs/contracts/dist/contracts/BaseCurrency'
import { peggyDenomToContractAddress } from '../transformers/peggy'
import { getContracts } from '~/app/singletons/Contracts'
import { TESTNET_CHAIN_ID, TESTNET_GAS_PRICE } from '~/app/utils/constants'
import { getTransactionOptions } from '~/app/utils/transaction'
import { getWeb3Strategy, transactionReceiptAsync } from '~/app/web3'
import { Token, TokenWithBalance } from '~/types'

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
      chainId: TESTNET_CHAIN_ID
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
    chainId: TESTNET_CHAIN_ID
  })
  const setAllowanceOfContractFunction = erc20Contract.setAllowanceOf({
    amount,
    contractAddress: contracts.peggy.address,
    transactionOptions: getTransactionOptions({
      gasPrice: gasPrice.toFixed(),
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
      { address, chainId: TESTNET_CHAIN_ID }
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
      gasPrice: gasPrice.toFixed(),
      from: address
    })
  })

  const data = depositForContractFunction.getABIEncodedTransactionData()
  const gas = new BigNumberInWei(
    await depositForContractFunction.estimateGasAsync()
  )
  const actualGasPrice = new BigNumberInBase(
    gasPrice.lt(TESTNET_GAS_PRICE)
      ? gasPrice.toNumber()
      : TESTNET_GAS_PRICE.toNumber()
  )

  try {
    const txHash = await web3Strategy.sendTransaction(
      {
        from: address,
        to: contracts.peggy.address,
        gas: gas.toNumber().toString(16),
        gasPrice: actualGasPrice.toNumber().toString(16),
        data
      },
      { address, chainId: TESTNET_CHAIN_ID }
    )
    await transactionReceiptAsync(txHash)
  } catch (error) {
    throw new Web3Exception(error.message)
  }
}

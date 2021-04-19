import { Wallet } from '@injectivelabs/web3-strategy'
import { AccountAddress } from '@injectivelabs/ts-types'
import { Web3Exception } from '@injectivelabs/exceptions'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { peggyDenomToContractAddress } from '../transformers/peggy'
import { getContracts } from '~/app/singletons/Contracts'
import { TESTNET_CHAIN_ID, TESTNET_GAS_PRICE } from '~/app/utils/constants'
import { getTransactionOptions } from '~/app/utils/transaction'
import {
  getWeb3Strategy,
  initWeb3Strategy,
  transactionReceiptAsync
} from '~/app/web3'

export const connect = async (wallet: Wallet): Promise<AccountAddress[]> => {
  const web3Strategy = initWeb3Strategy(wallet)
  const addresses = await web3Strategy.getAddresses()

  if (addresses.length === 0) {
    throw new Web3Exception('There are no addresses linked in this wallet.')
  }

  return addresses
}

export const confirm = async (address: AccountAddress) => {
  const web3Strategy = getWeb3Strategy()

  return await web3Strategy.confirm(address)
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
